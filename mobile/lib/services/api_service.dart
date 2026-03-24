import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Production Server User
  static final String _baseUrl = 'http://85.90.244.28:8080';

  static Future<Map<String, String>> _getHeaders({bool isMultipart = false}) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    final headers = <String, String>{};
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }

  // --- AUTH ---
  static Future<Map<String, dynamic>> login(String email, String password) async {
    final url = Uri.parse('$_baseUrl/api/v1/auth/login');
    final response = await http.post(
      url,
      headers: await _getHeaders(),
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data != null && data['token'] != null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', data['token']);
      }
      return data;
    } else {
      throw Exception('Failed to login: ${response.statusCode}');
    }
  }
  
  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }

  // --- POLICIES ---
  static Future<List<dynamic>> getUserPolicies() async {
    final url = Uri.parse('$_baseUrl/api/v1/policies');
    final response = await http.get(url, headers: await _getHeaders());

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load policies: ${response.statusCode}');
    }
  }

  static Future<Map<String, dynamic>> getPolicyById(String id) async {
    final url = Uri.parse('$_baseUrl/api/v1/policies/$id');
    final response = await http.get(url, headers: await _getHeaders());

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load policy: ${response.statusCode}');
    }
  }

  // --- QUOTES & PAYMENTS ---
  static Future<Map<String, dynamic>> calculateQuote(Map<String, dynamic> request) async {
    final url = Uri.parse('$_baseUrl/api/v1/quotes/calculate');
    final response = await http.post(
      url,
      headers: await _getHeaders(),
      body: jsonEncode(request),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to calculate quote: ${response.statusCode}');
    }
  }

  static Future<Map<String, dynamic>> purchaseMotorPolicy(Map<String, dynamic> request) async {
    final url = Uri.parse('$_baseUrl/api/v1/payments/purchase/motor');
    final response = await http.post(
      url,
      headers: await _getHeaders(),
      body: jsonEncode(request),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to purchase policy: ${response.statusCode}');
    }
  }

  // --- CLAIMS ---
  static Future<List<dynamic>> getUserClaims() async {
    final url = Uri.parse('$_baseUrl/api/v1/claims/user');
    final response = await http.get(url, headers: await _getHeaders());

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load user claims: ${response.statusCode}');
    }
  }

  static Future<Map<String, dynamic>> submitClaim(String policyId, String payoutType, String description, List<File>? evidences) async {
    final url = Uri.parse('$_baseUrl/api/v1/claims/file');
    var request = http.MultipartRequest('POST', url);
    request.headers.addAll(await _getHeaders(isMultipart: true));

    request.fields['policyId'] = policyId;
    request.fields['payoutType'] = payoutType;
    request.fields['description'] = description;

    if (evidences != null && evidences.isNotEmpty) {
      for (var evidence in evidences) {
        request.files.add(await http.MultipartFile.fromPath(
          'files', 
          evidence.path,
        ));
      }
    }

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 200 || response.statusCode == 201) {
      // Backend might return empty body or JSON
      if (response.body.isEmpty) return {};
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to submit claim: ${response.statusCode}');
    }
  }
}
