// ============================================================
// DARLINK — HELPER DE TESTS WIDGETS & NETWORK MOCK (QA)
// Évite les erreurs NetworkImage 400 dans l'environnement de test headless
// ============================================================

import 'dart:async';
import 'dart:io';

class MockHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    return _FakeHttpClient();
  }
}

class _FakeHttpClient implements HttpClient {
  @override
  dynamic noSuchMethod(Invocation invocation) {
    if (invocation.memberName == #openUrl ||
        invocation.memberName == #getUrl ||
        invocation.memberName == #postUrl) {
      return Future.value(_FakeHttpClientRequest());
    }
    return null;
  }
}

class _FakeHttpClientRequest implements HttpClientRequest {
  @override
  dynamic noSuchMethod(Invocation invocation) {
    if (invocation.memberName == #headers) {
      return _FakeHttpHeaders();
    }
    if (invocation.memberName == #close || invocation.memberName == #done) {
      return Future.value(_FakeHttpClientResponse());
    }
    return null;
  }
}

class _FakeHttpClientResponse extends Stream<List<int>> implements HttpClientResponse {
  static final List<int> _kTransparentPng = <int>[
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
    0x42, 0x60, 0x82,
  ];

  @override
  int get statusCode => HttpStatus.ok;

  @override
  int get contentLength => _kTransparentPng.length;

  @override
  HttpClientResponseCompressionState get compressionState =>
      HttpClientResponseCompressionState.notCompressed;

  @override
  StreamSubscription<List<int>> listen(
    void Function(List<int> event)? onData, {
    Function? onError,
    void Function()? onDone,
    bool? cancelOnError,
  }) {
    return Stream<List<int>>.value(_kTransparentPng).listen(
      onData,
      onError: onError,
      onDone: onDone,
      cancelOnError: cancelOnError,
    );
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => null;
}

class _FakeHttpHeaders implements HttpHeaders {
  @override
  dynamic noSuchMethod(Invocation invocation) => null;
}
