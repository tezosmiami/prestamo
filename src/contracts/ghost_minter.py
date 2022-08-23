import smartpy as sp

class GhostMinter(sp.Contract):

    royalties_type = sp.TRecord(
        address=sp.TAddress,
        royalties=sp.TNat).layout(
            ("address", "royalties"))

    def __init__(self, administrator, metadata):

        self.init_type(sp.TRecord(
            administrator=sp.TAddress,
            metadata=sp.TBigMap(sp.TString, sp.TBytes),
            proposed_administrator=sp.TOption(sp.TAddress)))
            # paused=sp.TBool))


        self.init(
            administrator=administrator,
            metadata=metadata,
            proposed_administrator=sp.none)
            # paused=False)

    def check_is_administrator(self):
        sp.verify(sp.sender == self.data.administrator,
                  message="MINTER_NOT_ADMIN")

    @sp.entry_point
    def mint(self, params):
        sp.set_type(params, sp.TRecord(
            editions=sp.TNat,
            fa2=sp.TAddress,
            metadata=sp.TMap(sp.TString, sp.TBytes),
            data=sp.TMap(sp.TString, sp.TBytes),
            royalties=sp.TNat).layout(
                ("fa2", ("editions", ("metadata", ("data", "royalties"))))))

        # sp.verify(~self.data.paused, message="MINT_PAUSED")
    
        sp.verify(params.royalties <= 250, message="MINT_INVALID_ROYALTIES")
        sp.verify(params.editions != 0, message="MINT_ZERO_EDITIONS")

      

        fa2_mint_handle = sp.contract(
            t=sp.TRecord(
                amount=sp.TNat,
                metadata=sp.TMap(sp.TString, sp.TBytes),
                data=sp.TMap(sp.TString, sp.TBytes),
                royalties=GhostMinter.royalties_type).layout(
                            ("amount", ("metadata", ("data", "royalties")))),
            address=params.fa2,
            entry_point="mint").open_some()

        # Mint the token
        sp.transfer(
            arg=sp.record(
                amount=params.editions,
                metadata=params.metadata,
                data=params.data,
                royalties=sp.record(
                    address=sp.sender,
                    royalties=params.royalties)),
            amount=sp.mutez(0),
            destination=fa2_mint_handle)

    @sp.entry_point
    def transfer_administrator(self, proposed_administrator):
        sp.set_type(proposed_administrator, sp.TAddress)
        self.check_is_administrator()
        self.data.proposed_administrator = sp.some(proposed_administrator)

    @sp.entry_point
    def accept_administrator(self):
        sp.verify(self.data.proposed_administrator.is_some(),
                  message="MINTER_NO_NEW_ADMIN")
        sp.verify(sp.sender == self.data.proposed_administrator.open_some(),
                  message="MINTER_NOT_PROPOSED_ADMIN")
        self.data.administrator = sp.sender
        self.data.proposed_administrator = sp.none

    @sp.entry_point
    def transfer_fa2_administrator(self, fa2, proposed_fa2_administrator):
        sp.set_type(proposed_fa2_administrator, sp.TAddress)
        sp.set_type(fa2, sp.TAddress)
        self.check_is_administrator()     
        fa2_transfer_administrator_handle = sp.contract(
            t=sp.TAddress,
            address=fa2,
            entry_point="transfer_administrator").open_some()
        sp.transfer(
            arg=proposed_fa2_administrator,
            amount=sp.mutez(0),
            destination=fa2_transfer_administrator_handle)

    @sp.entry_point
    def accept_fa2_administrator(self, fa2):
        sp.set_type(fa2, sp.TAddress)
        self.check_is_administrator()

        fa2_accept_administrator_handle = sp.contract(
            t=sp.TUnit,
            address=fa2,
            entry_point="accept_administrator").open_some()
   
        sp.transfer(
            arg=sp.unit,
            amount=sp.mutez(0),
            destination=fa2_accept_administrator_handle)

    # @sp.entry_point
    # def set_pause(self, pause):
    #     """Pause or not minting with the contract.

    #     """
    #     # Define the input parameter data type
    #     sp.set_type(pause, sp.TBool)

    #     # Check that the administrator executed the entry point
    #     self.check_is_administrator()

    #     # Pause or unpause the mints
    #     self.data.paused = pause

    # @sp.onchain_view(pure=True)
    # def is_paused(self):
    #     """Checks if the contract is paused.

    #     """
    #     # Return true if the contract is paused
    #     sp.result(self.data.paused)


sp.add_compilation_target("ghost_minter", GhostMinter(
    administrator=sp.address("tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6"),
    metadata=sp.utils.metadata_of_url("ipfs://aaa")))