import 'dart:convert';
import 'dart:developer';

import 'package:get/get_connect/http/src/response/response.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../util/app_constants.dart';
import '../api/api_client.dart';

class AuthRepo {
  final ApiClient apiClient;
  final SharedPreferences sharedPreferences;

  AuthRepo({required this.sharedPreferences, required this.apiClient});

  String getUserToken() {
    return sharedPreferences.getString(AppConstants.token) ?? "";
  }

  Future<bool> saveUserToken(String token) async {
    apiClient.updateHeader(token);
    return await sharedPreferences.setString(AppConstants.token, token);
  }

  bool isLoggedIn() {
    return sharedPreferences.containsKey(AppConstants.token);
  }

  Future<bool> clearSharedData() async {
    await sharedPreferences.remove(AppConstants.token);
    apiClient.updateHeader(null);
    return true;
  }

  Future<Response> userRegister({
    required String phone,
    required String name,
  }) async {
    return await apiClient.postData(AppConstants.userRegister, {
      "phone": phone,
      "name": name,
    });
  }

  Future<Response> verifyOtp({
    required String phone,
    required String otp,
    required String role,
  }) async {
    return await apiClient.postData(AppConstants.verifyOtp, {
      "phone": phone,
      "otp": otp,
      "role": role,
    });
  }


  Future<Response> addFavourite({
    required String id,
  }) async {
    return await apiClient.postData(AppConstants.addFavourite, {
      "templeId": id,

    });
  }

  Future<Response> removeFavourite({
    required String id,
  }) async {
    return await apiClient.postData(AppConstants.removeFavourite, {
      "templeId": id,

    });
  }

  Future<Response> sendOtp({required String phone,required String role}) async {
    return await apiClient.postData(AppConstants.sendOtp, {"phone": phone,"role": role});
  }

  Future<Response> getUser() async {
    return await apiClient.getData(AppConstants.getUser);
  }

  Future<Response> temples() async {
    return await apiClient.getData(AppConstants.temples);
  }Future<Response> favouritesTemple() async {
    return await apiClient.getData(AppConstants.favouritesTemple);
  }

  Future<Response> pooja() async {
    return await apiClient.getData(AppConstants.pooja);
  }  Future<Response> banners() async {
    return await apiClient.getData(AppConstants.banner);
  }

  Future<Response> templeDetails(String id) async {
    return await apiClient.getData("${AppConstants.templeDetails}/$id");
  }

  Future<Response> registerTemple(Map<String, dynamic> body) async {
    return await apiClient.postData(AppConstants.registerTemple, body);
  }

  Future<Response> registerTempleMultipart(Map<String, String> body, List<MultipartBody> multipartBody) async {
    return await apiClient.postMultipartDataAny(AppConstants.registerTemple, body, multipartBody);
  }
}
