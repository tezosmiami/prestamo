
import smartpy as sp

class GhostMarket(sp.Contract):

    royalties_type = sp.TRecord(
        address=sp.TAddress,
        royalties=sp.TNat).layout(
            ("address", "royalties"))

    swap_type = sp.TRecord(
        issuer=sp.TAddress,
        token_id=sp.TNat,
        editions=sp.TNat,
        price=sp.TMutez).layout(("issuer", ("token_id", ("editions", "price"))))

    def __init__(self, administrator, metadata, fee):
        self.init_type(sp.TRecord(
            administrator=sp.TAddress,
            metadata=sp.TBigMap(sp.TString, sp.TBytes),
            fee=sp.TNat,
            fee_recipient=sp.TAddress,
            swaps=sp.TBigMap(sp.TNat, GhostMarket.swap_type),
            counter=sp.TNat,
            proposed_administrator=sp.TOption(sp.TAddress)))
            # swaps_paused=sp.TBool,
            # collects_paused=sp.TBool))

     
        self.init(
            administrator=administrator,
            metadata=metadata,
            fee=fee,
            fee_recipient=administrator,
            swaps=sp.big_map(),
            counter=sp.nat(0),
            proposed_administrator=sp.none)
            # swaps_paused=False,
            # collects_paused=False)

    def check_is_administrator(self):
        sp.verify(sp.sender == self.data.administrator, message="NOT_ADMIN")


    @sp.entry_point
    def swap(self, params):
        sp.set_type(params, sp.TRecord(
            token_id=sp.TNat,
            fa2=sp.TAddress,
            editions=sp.TNat,
            price=sp.TMutez)).layout(
                ("token_id", ("editions", "price")))


      
        sp.verify(params.editions > 0, message="NO_SWAPPED_EDITIONS")

       
        royalties = sp.local("royalties",
                             self.get_token_royalties(
                                    token_id=params.token_id,
                                    fa2=params.fa2))
        total = sp.local("total",
                         self.data.fee + 
                         royalties.value.royalties)
        sp.verify(total.value <= 1000, message="PERCENTAGES_OFF")

        self.fa2_transfer(
            fa2=params.fa2,
            from_=sp.sender,
            to_=sp.self_address,
            token_id=params.token_id,
            token_amount=params.editions)

      
        self.data.swaps[self.data.counter] = sp.record(
            issuer=sp.sender,
            token_id=params.token_id,
            editions=params.editions,
            price=params.price)

        self.data.counter += 1

    @sp.entry_point
    def collect(self, swap_id, fa2):
        sp.set_type(fa2, sp.TAddress)   
        sp.set_type(swap_id, sp.TNat)
        # sp.verify(~self.data.collects_paused, message="COLLECTS_PAUSED")
        sp.verify(self.data.swaps.contains(swap_id), message="WRONG_SWAP_ID")
        swap = sp.local("swap", self.data.swaps[swap_id])
        sp.verify(sp.sender != swap.value.issuer, message="IS_SWAP_ISSUER")
        sp.verify(swap.value.editions > 0, message="ALL_COLLECTED")
        sp.verify(sp.amount == swap.value.price, message="WRONG_TEZ_AMOUNT")

        with sp.if_(sp.amount != sp.mutez(0)):
            royalties = sp.local(
                "royalties", self.get_token_royalties(
                    token_id = swap.value.token_id,
                    fa2 = fa2))
          
            royalties_amount = sp.local(
                "royalties_amount", sp.split_tokens(
                    sp.amount, royalties.value.royalties, 1000))

            with sp.if_(royalties_amount.value > sp.mutez(0)):
                sp.send(royalties.value.address,
                        royalties_amount.value)

            
            fee_amount = sp.local(
                "fee_amount", sp.split_tokens(sp.amount, self.data.fee, 1000))

            with sp.if_(fee_amount.value > sp.mutez(0)):
                sp.send(self.data.fee_recipient, fee_amount.value)

            sp.send(swap.value.issuer,
                    sp.amount - 
                    royalties_amount.value - 
                    fee_amount.value)

     
        self.fa2_transfer(
            fa2=fa2,
            from_=sp.self_address,
            to_=sp.sender,
            token_id=swap.value.token_id,
            token_amount=1)

     
        self.data.swaps[swap_id].editions = sp.as_nat(swap.value.editions - 1)

    @sp.entry_point
    def cancel_swap(self, swap_id, fa2):
        sp.set_type(fa2, sp.TAddress)  
        sp.set_type(swap_id, sp.TNat)  
        sp.verify(self.data.swaps.contains(swap_id), message="MP_WRONG_SWAP_ID")
        swap = sp.local("swap", self.data.swaps[swap_id])
        sp.verify(sp.sender == swap.value.issuer, message="MP_NOT_SWAP_ISSUER")
        sp.verify(swap.value.editions > 0, message="MP_SWAP_COLLECTED")
        self.fa2_transfer(
            fa2=fa2,
            from_=sp.self_address,
            to_=sp.sender,
            token_id=swap.value.token_id,
            token_amount=swap.value.editions)

        del self.data.swaps[swap_id]

    @sp.entry_point
    def update_fee(self, new_fee):
        sp.set_type(new_fee, sp.TNat)
        self.check_is_administrator()
        # self.check_no_tez_transfer()
        sp.verify(new_fee <= 250, message="WRONG_FEES") 
        self.data.fee = new_fee

    @sp.entry_point
    def update_fee_recipient(self, new_fee_recipient):
        sp.set_type(new_fee_recipient, sp.TAddress)
        self.check_is_administrator()
        # self.check_no_tez_transfer()
        self.data.fee_recipient = new_fee_recipient

    @sp.entry_point
    def transfer_administrator(self, proposed_administrator):
        sp.set_type(proposed_administrator, sp.TAddress)
        self.check_is_administrator()
        # self.check_no_tez_transfer()
        self.data.proposed_administrator = sp.some(proposed_administrator)

    @sp.entry_point
    def accept_administrator(self):
        sp.verify(self.data.proposed_administrator.is_some(),
                  message="MP_NO_NEW_ADMIN")

        sp.verify(sp.sender == self.data.proposed_administrator.open_some(),
                  message="MP_NOT_PROPOSED_ADMIN")

        # self.check_no_tez_transfer()

        self.data.administrator = sp.sender

        self.data.proposed_administrator = sp.none

    # @sp.entry_point
    # def set_pause_swaps(self, pause):
    #     sp.set_type(pause, sp.TBool)
    #     self.check_is_administrator()
    #     self.check_no_tez_transfer()

    #     self.data.swaps_paused = pause

    # @sp.entry_point
    # def set_pause_collects(self, pause):
    #     sp.set_type(pause, sp.TBool)

    #     self.check_is_administrator() 
    #     self.check_no_tez_transfer()
    #     self.data.collects_paused = pause

    @sp.onchain_view()
    def get_administrator(self):
        sp.result(self.data.administrator)

    @sp.onchain_view()
    def has_swap(self, swap_id):
        sp.set_type(swap_id, sp.TNat)
        sp.result(self.data.swaps.contains(swap_id))

    @sp.onchain_view()
    def get_swap(self, swap_id):
    
        sp.set_type(swap_id, sp.TNat)
        sp.verify(self.data.swaps.contains(swap_id), message="MP_WRONG_SWAP_ID")
        sp.result(self.data.swaps[swap_id])

    @sp.onchain_view()
    def get_swaps_counter(self):
        sp.result(self.data.counter)

    @sp.onchain_view()
    def get_fee(self):
        sp.result(self.data.fee)

    @sp.onchain_view()
    def get_fee_recipient(self):
        sp.result(self.data.fee_recipient)

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

        # Transfer the FA2 token editions to the new address
        sp.transfer(
            arg=sp.list([sp.record(
                from_=from_,
                txs=sp.list([sp.record(
                    to_=to_,
                    token_id=token_id,
                    amount=token_amount)]))]),
            amount=sp.mutez(0),
            destination=c)

    def get_token_royalties(self, token_id, fa2):
        return sp.view(
            name="token_royalties",
            address=fa2,
            param=token_id,
            t=GhostMarket.royalties_type).open_some()


sp.add_compilation_target("ghost_market", GhostMarket(
    administrator=sp.address("tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6"),
   metadata=sp.utils.metadata_of_url("ipfs://aaa"),
    fee=sp.nat(25)))