##Original basic functionality Prestamo Market Contract

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
        term=sp.TInt, #in days now
        start_time=sp.TOption(sp.TTimestamp),
        active=sp.TBool,
        tokens=sp.TList(token_type))

    def __init__(self, metadata):
        self.init_type(sp.TRecord(
            metadata=sp.TBigMap(sp.TString, sp.TBytes),
            markets=sp.TBigMap(sp.TNat, Prestamo.market_type),
            counter=sp.TNat))

        # Initialize the contract storage
        self.init(
            metadata=metadata,
            markets=sp.big_map(),
            counter=0)

        self.generate_contract_metadata()
        
    def generate_contract_metadata(self):
        """Generate a metadata json file with all the contract's offchain views
        and standard TZIP-12 and TZIP-016 key/values."""
        metadata_base = {
            "name": 'Prestamo',
            "description": 'P2P NFT Collateralized Lending',
            "version": "1.0.0",
            "interfaces": ["TZIP-012", "TZIP-016"],
            "authors": [
                "tezosmiami <https://github.com/tezosmiami>"
            ],
            "homepage": "https://www.prestamo.art",
            "source": {
                "tools": ["SmartPy"],
                "location": "https://github.com/prestamo",
            },
            "license": { "name": "MIT" }
        }
        offchain_views = []
        for f in dir(self):
            attr = getattr(self, f)
            if isinstance(attr, sp.OnOffchainView):
                # Include onchain views as tip 16 offchain views
                offchain_views.append(attr)
        metadata_base["views"] = offchain_views
 
    def check_zero_amount(self):
        sp.verify(sp.amount > sp.mutez(0), message="ZERO_AMOUNT")


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
         market = sp.local('market', self.data.markets.get(market_id, message="WRONG_MARKET_ID")).value
         sp.verify(market.active == True, message ="MARKET_NOT_ACTIVE")
         sp.verify(market.taker == sp.none, message="MARKET_TAKEN") 
         sp.verify(sp.sender != market.maker, message="MAKER_TAKER")
         sp.verify(sp.amount == market.amount, message="TEZ_SENT_DOESNT_MATCH_MARKET")
        
         sp.send(market.maker, sp.amount) 
         self.data.markets[market_id].start_time = sp.some(sp.now)
         self.data.markets[market_id].taker = sp.some(sp.sender)


    @sp.entry_point    
    def cancel_market(self,market_id):
        sp.set_type(market_id, sp.TNat)
        market = sp.local('market', self.data.markets.get(market_id, message="WRONG_MARKET_ID")).value
        sp.verify(market.active == True, message = "MARKET_NOT_ACTIVE" )    
        sp.verify(market.maker == sp.sender, message = "NOT_MAKER")
        sp.verify(~market.taker.is_some(), message = "MARKET_ALREADY_TAKEN")
        
        sp.for x in market.tokens:
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
        market = sp.local('market', self.data.markets.get(market_id, message="WRONG_MARKET_ID")).value
        sp.verify(market.active == True, message = "MARKET_NOT_ACTIVE" )    
        sp.verify(market.taker.is_some(), message = "MARKET_NOT_TAKEN")
        sp.verify(market.taker == sp.some(sp.sender), message = "NOT_TAKER")  
        sp.verify(sp.now > market.start_time.open_some().add_days(market.term), message = "STILL_TIME")
        
        sp.for x in market.tokens:
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
        market = sp.local('market', self.data.markets.get(market_id, message="WRONG_MARKET_ID")).value
        sp.verify(market.active == True, message = "MARKET_NOT_ACTIVE" )
        sp.verify(market.maker == sp.sender, message = "NOT_MAKER")
        sp.verify(market.taker.is_some(), message = "MARKET_NOT_TAKEN")
        sp.verify(sp.now < market.start_time.open_some().add_days(market.term), message = "TIMES_UP")    
        
        interest_amount = sp.local(
                "interest_amount", sp.split_tokens(self.data.markets[market_id].amount, self.data.markets[market_id].interest, 1000))  
     
        sp.verify((market.amount + interest_amount.value)  == sp.amount, message = "WRONG_AMOUNT")
        
        sp.for x in self.data.markets[market_id].tokens:
            self.fa2_transfer(
            fa2 = x.contract_address,
            from_= sp.self_address,
            to_= sp.sender,
            token_id = x.token_id,
            token_amount = x.token_amount)
        sp.send(market.taker.open_some(), sp.amount)
        self.data.markets[market_id].active = False  

   
    @sp.onchain_view()
    def market_is_active(self,market_id):
        sp.result(self.data.markets[market_id].active)

    @sp.onchain_view()
    def get_market(self, market_id):
        sp.set_type(market_id, sp.TNat)
        sp.verify(self.data.markets.contains(market_id), message="WRONG_MARKET_ID")
        sp.result(self.data.markets[market_id])

    @sp.onchain_view()
    def get_markets_counter(self):
        sp.result(self.data.counter)

sp.add_compilation_target("prestamo", Prestamo(
    metadata=sp.utils.metadata_of_url("ipfs://QmdjyY7GuajM785KaQfZiMLv89h2Y4w5kL5gCPSvXBhYGT")))
@sp.add_test(name="Prestamo")

def test():
    sc = sp.test_scenario()
    sc.table_of_contents()
    sc.h1("Accounts")
    sc.show(["tz1ag87A25Q3uAHoDXGiJz6Bwv6uTefEFEqN"])
    sc.h2("Prestamo")
    c1 = Prestamo(
    metadata=sp.utils.metadata_of_url("ipfs://QmdjyY7GuajM785KaQfZiMLv89h2Y4w5kL5gCPSvXBhYGT"))
    sc += c1