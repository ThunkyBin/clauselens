"""Studio-backed smoke test; run explicitly with `gltest tests/integration/ -v`."""

import pytest
from gltest import default_account, get_contract_factory


@pytest.mark.integration
def test_deploy_and_read_empty_owner_watch_count():
    contract = get_contract_factory("ClauseLens").deploy()
    count = contract.get_watch_count(args=[default_account.address])
    assert count == 0
