import socket

import pytest


@pytest.fixture(autouse=True)
def no_live_network(monkeypatch):
    original_connect = socket.socket.connect

    def blocked(*args, **kwargs):
        raise AssertionError("Tests must not make real network calls")

    def local_event_loop_only(sock, address):
        # Windows asyncio creates its self-pipe through a loopback socket pair.
        if isinstance(address, tuple) and address[0] in {"127.0.0.1", "::1"}:
            return original_connect(sock, address)
        return blocked()

    monkeypatch.setattr(socket.socket, "connect", local_event_loop_only)
    monkeypatch.setattr(socket, "create_connection", blocked)
