import smartpy as sp


class Prestamo(sp.Contract):

    token_type = sp.TRecord(
        contract_address=sp.TAddress,
        token_id=sp.TNat,
        token_amount=sp.TNat).layout(
            ("contract_address", ("token_id", "token_amount")))
    
    market_type = sp.TRecord(
        maker=sp.TAddress,
        taker=sp.TOption(sp.TAddress),
        amount=sp.TMutez,
        interest=sp.TNat,
        term=sp.TInt, #in minutes
        start_time=sp.TOption(sp.TTimestamp),
        active=sp.TBool,
        tokens=sp.TList(token_type))

    def __init__(self, admin, metadata, fee):
        self.init_type(sp.TRecord(
            admin=sp.TAddress,
            metadata=sp.TBigMap(sp.TString, sp.TBytes),
            # fa2s=sp.TSet(sp.TAddress),
            fee=sp.TNat,
            fees_recipient=sp.TAddress,
            markets=sp.TBigMap(sp.TNat, Prestamo.market_type),
            counter=sp.TNat,
            proposed_admin=sp.TOption(sp.TAddress),
            markets_paused=sp.TBool))

        # Initialize the contract storage
        self.init(
            admin=admin,
            metadata=metadata,
            fee=fee,
            # fa2s=sp.set([]),
            fees_recipient=admin,
            markets=sp.big_map(),
            counter=0,
            proposed_admin=sp.none,
            markets_paused=False)

    def check_admin(self):
        sp.verify(sp.sender == self.data.admin, message="ADMIN_REQUIRED")
    
    def check_zero_amount(self):
        sp.verify(sp.amount > sp.mutez(0), message="ZERO_AMOUNT")

    # def check_fa2(self, fa2):
    # def check_is_maker(self):
    # def check_is_taker(self):
    # def check_is_open(self):   
    # def check_term(self):

    def fa2_transfer(self, fa2, from_, to_, token_id, token_amount):
        c = sp.contract(
            t=sp.TList(sp.TRecord(
                from_=sp.TAddress,
                txs=sp.TList(sp.TRecord(
                    to_=sp.TAddress,
                    token_id=sp.TNat,
                    amount=sp.TNat).layout(("to_", ("token_id", "amount")))))),
            address=fa2,
            entry_point="transfer").open_some()
            
        sp.transfer(
            arg=sp.list([sp.record(
                from_=from_,
                txs=sp.list([sp.record(
                    to_=to_,
                    token_id=token_id,
                    amount=token_amount)]))]),
            amount=sp.mutez(0),
            destination=c)

    @sp.entry_point
    def make_market(self, params): 
        sp.set_type(params, sp.TRecord(
            amount=sp.TMutez,
            interest=sp.TNat,
            term=sp.TInt,
            tokens=sp.TList(Prestamo.token_type)).layout(
                ("amount", ("interest", ("term", "tokens")))))
        sp.verify(~self.data.markets_paused, message="markets_PAUSED")
        sp.verify(params.amount > sp.tez(1), message="LOW_AMOUNT")
        sp.verify(sp.len(params.tokens) > 0, message="ZERO_FA2s")
        sp.verify(params.term > 0, message="ZERO_TERM")
        sp.verify((params.interest > 0) & (params.interest < 1000), message="WRONG_INTEREST")        
    
        # sp.for x in params.tokens:
        #     sp.verify(self.data.fa2s.contains(x.contract_address), message="FA2_NOT_PERMITTED")  
       
        sp.for x in params.tokens:
            self.fa2_transfer(
            fa2=x.contract_address,
            from_=sp.sender,
            to_=sp.self_address,
            token_id=x.token_id,
            token_amount=x.token_amount)

        
        self.data.markets[self.data.counter] = sp.record(
            maker=sp.sender,
            taker=sp.none,
            amount=params.amount,
            start_time=sp.none,
            interest=params.interest,
            term=params.term,
            active=True,
            tokens=params.tokens)
        
        self.data.counter += 1


    @sp.entry_point    
    def take_market(self,market_id):
         sp.set_type(market_id, sp.TNat)
         sp.verify(self.data.markets.contains(market_id), message="WRONG_market_ID")
         sp.verify(self.data.markets[market_id].active == True, message ="MARKET_NOT_ACTIVE")
         sp.verify(self.data.markets[market_id].taker == sp.none, message="MARKET_TAKEN") 
         sp.verify(sp.sender != self.data.markets[market_id].maker, message="MAKER_TAKER")
         sp.verify(sp.amount == self.data.markets[market_id].amount, message="TEZ_SENT_DOESNT_MATCH_MARKET")
        
        #check math
         fee_amount = sp.local(
                "fee_amount", sp.split_tokens(sp.amount, self.data.fee, 1000))
        
         sp.send(self.data.markets[market_id].maker,
                        (sp.amount-fee_amount.value)) 
         self.data.markets[market_id].start_time = sp.some(sp.now)
         self.data.markets[market_id].taker = sp.some(sp.sender)
         sp.send(self.data.fees_recipient, fee_amount.value)

    @sp.entry_point    
    def cancel_market(self,market_id):
        sp.set_type(market_id, sp.TNat)
        sp.verify(self.data.markets[market_id].maker == sp.sender, message = "NOT_MAKER")
        sp.verify(~self.data.markets[market_id].taker.is_some(), message = "MARKERT_ALREADY_TAKEN")
        sp.verify(self.data.markets[market_id].active == True, message = "MARKET_NOT_ACTIVE" )    
        
        sp.for x in self.data.markets[market_id].tokens:
            self.fa2_transfer(
            fa2 = x.contract_address,
            from_= sp.self_address,
            to_= sp.sender,
            token_id = x.token_id,
            token_amount = x.token_amount)

        self.data.markets[market_id].active = False

    @sp.entry_point    
    def claim_market(self,market_id):
        sp.set_type(market_id, sp.TNat)
        sp.verify(self.data.markets.contains(market_id), message="WRONG_market_ID")
        sp.verify(self.data.markets[market_id].taker == sp.some(sp.sender), message = "NOT_TAKER")
        # sp.verify(self.data.markets[market_id].taker.is_some(), message = "MARKET_ALREADY_TAKEN")
        sp.verify(self.data.markets[market_id].active == True, message = "MARKET_NOT_ACTIVE" )    
        sp.verify(sp.now > self.data.markets[market_id].start_time.open_some().add_minutes(self.data.markets[market_id].term), message = "STILL_TIME")
        
        sp.for x in self.data.markets[market_id].tokens:
            self.fa2_transfer(
            fa2 = x.contract_address,
            from_= sp.self_address,
            to_= sp.sender,
            token_id = x.token_id,
            token_amount = x.token_amount)

        self.data.markets[market_id].active = False
   
    #check math
    @sp.entry_point
    def recover_market(self, market_id): 
        sp.set_type(market_id, sp.TNat)
        sp.verify(self.data.markets.contains(market_id), message="WRONG_market_ID")
        sp.verify(self.data.markets[market_id].maker == sp.sender, message = "NOT_MAKER")
        sp.verify(self.data.markets[market_id].taker.is_some(), message = "MARKET_NOT_TAKEN")
        sp.verify(self.data.markets[market_id].active == True, message = "MARKET_NOT_ACTIVE" )
        sp.verify(sp.now < self.data.markets[market_id].start_time.open_some().add_minutes(self.data.markets[market_id].term), message = "TIMES_UP")    
        
        interest_amount = sp.local(
                "interest_amount", sp.split_tokens(self.data.markets[market_id].amount, self.data.markets[market_id].interest, 1000))  
        
        fee_amount = sp.local(
                "fee_amount", sp.split_tokens(sp.amount, self.data.fee, 1000))
        
        sp.verify((self.data.markets[market_id].amount + interest_amount.value)  == sp.amount, message = "WRONG_AMOUNT")
        
        sp.for x in self.data.markets[market_id].tokens:
            self.fa2_transfer(
            fa2 = x.contract_address,
            from_= sp.self_address,
            to_= sp.sender,
            token_id = x.token_id,
            token_amount = x.token_amount)
            #fee
        sp.send(self.data.fees_recipient, fee_amount.value)
        sp.send(self.data.markets[market_id].taker.open_some(), (sp.amount-fee_amount.value))
        self.data.markets[market_id].active = False  
        
    # @sp.entry_point    
    # def withdraw_fees(self,amount):    
    

    @sp.entry_point
    def propose_admin(self, proposed_admin):
        sp.set_type(proposed_admin, sp.TAddress)
        self.check_admin()
        self.data.proposed_admin = sp.some(proposed_admin)

    
    @sp.entry_point    
    def accept_admin(self):  
        sp.verify(self.data.proposed_admin.is_some(), message="NO_PROPOSED_ADMIN")
        sp.verify(sp.sender == self.data.proposed_admin.open_some(), message="NOT_PROPOSED_ADMIN")
        self.data.admin = sp.sender
        self.data.proposed_admin = sp.none


    @sp.entry_point
    def update_fee(self, fee):
        sp.set_type(fee, sp.TNat)
        self.check_admin()
        sp.verify(fee <= 180, message = "FEE_LIMIT_REACHED") 
        self.data.fee = fee

    @sp.entry_point
    def update_fees_recipient(self, fees_to):
        sp.set_type(fees_to, sp.TAddress)
        self.check_admin()
        self.data.fees_recipient = fees_to

sp.add_compilation_target("prestamo", Prestamo(
    admin=sp.address("tz1ag87A25Q3uAHoDXGiJz6Bwv6uTefEFEqN"),
    metadata=sp.utils.metadata_of_url("ipfs://aaa"),
    fee=sp.nat(18)))

@sp.add_test(name="Prestamo")
def test():
    sc = sp.test_scenario()
    sc.table_of_contents()
    sc.h1("Accounts")
    sc.show(["tz1M9CMEtsXm3QxA7FmMU2Qh7xzsuGXVbcDr"])
    sc.h2("Prestamo")
    c1 = Prestamo(
      admin=sp.address("tz1ag87A25Q3uAHoDXGiJz6Bwv6uTefEFEqN"),
      metadata=sp.utils.metadata_of_url("ipfs://aaa"),
      fee=sp.nat(18)
    )
    sc += c1