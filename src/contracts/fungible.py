
import smartpy as sp

admin=sp.address("tz1ag87A25Q3uAHoDXGiJz6Bwv6uTefEFEqN")

FA2 = sp.io.import_script_from_url("https://smartpy.io/templates/fa2_lib.py")

token_md = FA2.make_metadata(name="Prestamo", decimals=8, symbol="PRESTA")

class ExampleFa2Fungible(
    FA2.Admin,
    FA2.ChangeMetadata,
    FA2.WithdrawMutez,
    FA2.MintFungible,
    FA2.BurnFungible,
    FA2.OffchainviewTokenMetadata,
    FA2.OnchainviewBalanceOf,
    FA2.Fa2Fungible,
):
        def __init__(self, **kwargs):
            FA2.Fa2Fungible.__init__(self, **kwargs)
            FA2.Admin.__init__(self, admin)

 
sp.add_compilation_target( "Fa2",ExampleFa2Fungible(   
            metadata = sp.utils.metadata_of_url("http://example.com"),
            metadata_base = {
            "version": "1.0.0",
            "description" : "This implements FA2 (TZIP-012) using SmartPy.",
            "interfaces": ["TZIP-012", "TZIP-016"],
            "authors": ["SmartPy <https://smartpy.io/#contact>"],
            "homepage": "https://smartpy.io/ide?template=FA2.py",
            "source": {
                "tools": ["SmartPy"],
                "location": "https://gitlab.com/SmartPy/smartpy/-/raw/master/python/templates/FA2.py"
            },
            "permissions": {
                "receiver": "owner-no-hook",
                "sender": "owner-no-hook"
            }
        },
        token_metadata = [token_md]
    )
)

@sp.add_test(name="Prestamo")
def test():
    sc = sp.test_scenario()
    sc.table_of_contents()
    sc.h1("Accounts")
    sc.show(["KT1Dx5Fi4GiiMPdDuQYPBSZJdr4XdhdWmSyC"])
    sc.h2("Prestamo")
    c1 = ExampleFa2Fungible(   
        metadata = sp.utils.metadata_of_url("ipfs://QmUo3Sr2pjh9Trwq1vZatzzoDhtXyq1JZnJmAkDmtrU9w4"),
        metadata_base = {
            "name": "Prestamo Tokens",
            "version": "1.0.0",
            "description" : "This implements FA2 (TZIP-012) using SmartPy.",
            "interfaces": ["TZIP-012", "TZIP-016"],
            "authors": ["SmartPy <https://smartpy.io/#contact>"],
            "homepage": "https://smartpy.io/ide?template=FA2.py",
            "source": {
                "tools": ["SmartPy"],
                "location": "https://gitlab.com/SmartPy/smartpy/-/raw/master/python/templates/FA2.py"
            },
            "permissions": {
                "receiver": "owner-no-hook",
                "sender": "owner-no-hook"
            }
        },
        token_metadata = [token_md]
    )

    sc += c1