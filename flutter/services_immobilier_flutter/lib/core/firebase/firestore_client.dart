// ============================================================
// DARLINK — CLIENT CLOUD FIRESTORE & FIREBASE AUTH (Flutter)
// Client REST haute performance pour Cloud Firestore v1 et Auth
// ============================================================

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'firebase_config.dart';

class FirestoreClient {
  static final FirestoreClient instance = FirestoreClient._internal();
  FirestoreClient._internal();

  String? _idToken;
  String? get idToken => _idToken;

  void setIdToken(String? token) {
    _idToken = token;
    _persistToken(token);
  }

  Future<void> init() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _idToken = prefs.getString('darlink_firebase_token');
    } catch (_) {}
  }

  Future<void> _persistToken(String? token) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      if (token != null) {
        await prefs.setString('darlink_firebase_token', token);
      } else {
        await prefs.remove('darlink_firebase_token');
      }
    } catch (_) {}
  }

  Map<String, String> _headers() {
    final headers = {'Content-Type': 'application/json'};
    if (_idToken != null && _idToken!.isNotEmpty) {
      headers['Authorization'] = 'Bearer $_idToken';
    }
    return headers;
  }

  /// Conversion de valeur Dart en Value Firestore REST
  Map<String, dynamic> toFirestoreValue(dynamic val) {
    if (val == null) return {'nullValue': null};
    if (val is bool) return {'booleanValue': val};
    if (val is int) return {'integerValue': val.toString()};
    if (val is double) return {'doubleValue': val};
    if (val is String) return {'stringValue': val};
    if (val is List) {
      return {
        'arrayValue': {
          'values': val.map((item) => toFirestoreValue(item)).toList(),
        }
      };
    }
    if (val is Map) {
      final fields = <String, dynamic>{};
      val.forEach((k, v) {
        fields[k.toString()] = toFirestoreValue(v);
      });
      return {
        'mapValue': {'fields': fields}
      };
    }
    return {'stringValue': val.toString()};
  }

  /// Conversion de Value Firestore REST en valeur Dart native
  dynamic fromFirestoreValue(Map<String, dynamic> val) {
    if (val.containsKey('nullValue')) return null;
    if (val.containsKey('booleanValue')) return val['booleanValue'] as bool;
    if (val.containsKey('integerValue')) return int.tryParse(val['integerValue'].toString()) ?? 0;
    if (val.containsKey('doubleValue')) return (val['doubleValue'] as num).toDouble();
    if (val.containsKey('stringValue')) return val['stringValue'] as String;
    if (val.containsKey('timestampValue')) return val['timestampValue'] as String;
    if (val.containsKey('arrayValue')) {
      final arr = val['arrayValue'] as Map<String, dynamic>?;
      final values = arr?['values'] as List<dynamic>? ?? [];
      return values.map((item) => fromFirestoreValue(item as Map<String, dynamic>)).toList();
    }
    if (val.containsKey('mapValue')) {
      final map = val['mapValue'] as Map<String, dynamic>?;
      final fields = map?['fields'] as Map<String, dynamic>? ?? {};
      final res = <String, dynamic>{};
      fields.forEach((k, v) {
        res[k] = fromFirestoreValue(v as Map<String, dynamic>);
      });
      return res;
    }
    return null;
  }

  /// Conversion d'un objet Dart plat en Document Firestore
  Map<String, dynamic> toFirestoreDoc(Map<String, dynamic> data) {
    final fields = <String, dynamic>{};
    data.forEach((k, v) {
      if (v != null) {
        fields[k] = toFirestoreValue(v);
      }
    });
    return {'fields': fields};
  }

  /// Conversion d'un Document Firestore REST en Map Dart
  Map<String, dynamic> fromFirestoreDoc(Map<String, dynamic> doc) {
    final result = <String, dynamic>{};
    final fields = doc['fields'] as Map<String, dynamic>? ?? {};
    fields.forEach((k, v) {
      result[k] = fromFirestoreValue(v as Map<String, dynamic>);
    });
    final name = doc['name'] as String? ?? '';
    final docId = name.split('/').isNotEmpty ? name.split('/').last : '';
    if (!result.containsKey('id') || result['id'] == null || result['id'].toString().isEmpty) {
      result['id'] = docId;
    }
    return result;
  }

  /// Récupérer les documents d'une collection
  Future<List<Map<String, dynamic>>> getCollection(String collectionPath) async {
    final url = Uri.parse('${FirebaseConfig.firestoreBaseUrl}/$collectionPath?key=${FirebaseConfig.apiKey}');
    try {
      final response = await http.get(url, headers: _headers());
      if (response.statusCode == 200) {
        final body = json.decode(response.body) as Map<String, dynamic>;
        final docs = body['documents'] as List<dynamic>? ?? [];
        return docs.map((d) => fromFirestoreDoc(d as Map<String, dynamic>)).toList();
      }
    } catch (_) {}
    return [];
  }

  /// Récupérer un document unique
  Future<Map<String, dynamic>?> getDocument(String collectionPath, String docId) async {
    final url = Uri.parse(
        '${FirebaseConfig.firestoreBaseUrl}/$collectionPath/${Uri.encodeComponent(docId)}?key=${FirebaseConfig.apiKey}');
    try {
      final response = await http.get(url, headers: _headers());
      if (response.statusCode == 200) {
        final body = json.decode(response.body) as Map<String, dynamic>;
        return fromFirestoreDoc(body);
      }
    } catch (_) {}
    return null;
  }

  /// Écrire ou mettre à jour un document (Upsert)
  Future<bool> setDocument(String collectionPath, String docId, Map<String, dynamic> data) async {
    final url = Uri.parse(
        '${FirebaseConfig.firestoreBaseUrl}/$collectionPath/${Uri.encodeComponent(docId)}?key=${FirebaseConfig.apiKey}');
    final body = json.encode(toFirestoreDoc(data));
    try {
      final response = await http.patch(url, headers: _headers(), body: body);
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  /// Supprimer un document
  Future<bool> deleteDocument(String collectionPath, String docId) async {
    final url = Uri.parse(
        '${FirebaseConfig.firestoreBaseUrl}/$collectionPath/${Uri.encodeComponent(docId)}?key=${FirebaseConfig.apiKey}');
    try {
      final response = await http.delete(url, headers: _headers());
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
