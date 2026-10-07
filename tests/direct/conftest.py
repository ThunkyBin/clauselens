"""Shared helpers for direct mode tests."""

import os
import tempfile


# genlayer-test 0.29.2 replaces fd 0 with a temporary file and unlinks it while
# fd 0 is still open. POSIX permits that; Windows raises PermissionError. Keep
# only those locked test-temp paths for cleanup at the end of the pytest run.
_unlink = os.unlink
_deferred_temp_unlinks = []


def _windows_safe_unlink(path, *args, **kwargs):
    try:
        return _unlink(path, *args, **kwargs)
    except PermissionError:
        candidate = os.fspath(path)
        if candidate.startswith(tempfile.gettempdir()) and os.path.basename(candidate).startswith("tmp"):
            _deferred_temp_unlinks.append(candidate)
            return None
        raise


os.unlink = _windows_safe_unlink


def pytest_sessionfinish(session, exitstatus):
    for candidate in _deferred_temp_unlinks:
        try:
            _unlink(candidate)
        except OSError:
            pass


def to_hex(addr_bytes):
    """Convert address bytes to checksummed hex matching contract output.

    The contract's get_bets()/get_points() return keys via Address.as_hex,
    which produces EIP-55 checksummed hex. Call after direct_deploy so the
    SDK is on sys.path.
    """
    if hasattr(addr_bytes, "as_hex"):
        return addr_bytes.as_hex
    from genlayer.py.types import Address

    return Address(addr_bytes).as_hex
