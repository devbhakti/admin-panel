import 'dart:convert';
import 'dart:developer';

import 'package:devbhakti/data/model/response/banner_model.dart';
import 'package:devbhakti/data/model/response/favourite_temple.dart';
import 'package:devbhakti/data/model/response/pooja_model.dart';
import 'package:devbhakti/data/model/response/temple_details_model.dart';
import 'package:devbhakti/data/model/response/temple_model.dart';
import 'package:devbhakti/data/model/response/user_model.dart';
import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';

import '../data/api/api_checker.dart';
import '../data/api/api_client.dart';
import '../data/model/base/response_model.dart';
import '../data/repository/auth_repo.dart';
import '../views/base/custom_snackbar.dart';

class AuthController extends GetxController implements GetxService {
  final AuthRepo authRepo;

  AuthController({required this.authRepo});



  bool isLoading = false;


  List<TempleModel> getTemplesList=[];
  List<PoojaModel> getPoojaList=[];
  List<BannerModel> getBannerList=[];
  List<TempleFavouriteModel> getFavouriteTemplesList=[];

  TempleDetailsModel?templeDetailsModel;
  UserModel?userModel;

  String ?otp;
  Future<ResponseModel> userRegister({
  required String phone,
  required String name,
}
  ) async {
    isLoading = true;
    update();
    Response response = await authRepo.userRegister(phone: phone,name: name);
    ResponseModel responseModel = await checkResponseModel(response);
    showCustomSnackBar(responseModel.message, isError: !responseModel.status);
    log(jsonEncode(response.statusCode));
    if (responseModel.status) {
      otp=responseModel.data["otp"];

    }
    isLoading = false;
    update();
    return responseModel;
  }

  Future<ResponseModel> verifyOtp({
  required String phone,
  required String otp,
  required String role,
}
  ) async {
    isLoading = true;
    update();
    Response response = await authRepo.verifyOtp(phone: phone,otp: otp,role:role);
    print("API Response: ${response.statusCode} - ${response.bodyString}");
    ResponseModel responseModel = await checkResponseModel(response);
    showCustomSnackBar(responseModel.message, isError: !responseModel.status);
    log(jsonEncode(response.statusCode));
    if (responseModel.status) {
      authRepo.saveUserToken(responseModel.data['token']);

    }
    isLoading = false;
    update();
    return responseModel;
  }


  Future<ResponseModel> addFavourite({
  required String id,
}
  ) async {
    isLoading = true;
    update();
    Response response = await authRepo.addFavourite(id: id);
    ResponseModel responseModel = await checkResponseModel(response);
    // showCustomSnackBar(responseModel.message, isError: !responseModel.status);
    log(jsonEncode(response.statusCode));
    if (responseModel.status) {

    }
    isLoading = false;
    update();
    return responseModel;
  }

  Future<ResponseModel> removeFavourite({
  required String id,
}
  ) async {
    isLoading = true;
    update();
    Response response = await authRepo.removeFavourite(id: id);
    ResponseModel responseModel = await checkResponseModel(response);
    // showCustomSnackBar(responseModel.message, isError: !responseModel.status);
    log(jsonEncode(response.statusCode));
    if (responseModel.status) {

    }
    isLoading = false;
    update();
    return responseModel;
  }

  Future<ResponseModel> sendOtp({
  required String phone,
  required String role,
}
  ) async {
    isLoading = true;
    update();
    Response response = await authRepo.sendOtp(phone: phone, role: role,);
    ResponseModel responseModel = await checkResponseModel(response);
    showCustomSnackBar(responseModel.message, isError: !responseModel.status);
    log(jsonEncode(response.statusCode));
    if (responseModel.status) {
      // authRepo.saveUserToken(responseModel.data['token']);

      otp=responseModel.data["otp"];


      // getBrandList = brandModelFromJson(jsonEncode(responseModel.data));
    }
    isLoading = false;
    update();
    return responseModel;
  }

  Future<ResponseModel> temples(
  ) async {
    getTemplesList.clear();
    isLoading = true;
    update();
    Response response = await authRepo.temples();
    ResponseModel responseModel = await checkResponseModel(response);
    // showCustomSnackBar(responseModel.message, isError: !responseModel.status);
    log(jsonEncode(response.statusCode));
    if (responseModel.status) {
getTemplesList = templeModelFromJson(jsonEncode(responseModel.data));
    }
    isLoading = false;
    update();
    return responseModel;
  }

  Future<ResponseModel> getUser(
  ) async {
    isLoading = true;
    update();
    Response response = await authRepo.getUser();
    ResponseModel responseModel = await checkResponseModel(response);
    showCustomSnackBar(responseModel.message, isError: !responseModel.status);
    log(jsonEncode(response.statusCode));
    if (responseModel.status) {
      userModel = userModelFromJson(jsonEncode(responseModel.data));
    }
    isLoading = false;
    update();
    return responseModel;
  }


 Future<ResponseModel> favouritesTemple(
  ) async {
   getFavouriteTemplesList.clear();
    isLoading = true;
    update();
    Response response = await authRepo.favouritesTemple();
    ResponseModel responseModel = await checkResponseModel(response);
    // showCustomSnackBar(responseModel.message, isError: !responseModel.status);
    log(jsonEncode(response.statusCode));
    if (responseModel.status) {



       getFavouriteTemplesList = templeFavouriteModelFromJson(jsonEncode(responseModel.data));
    }
    isLoading = false;
    update();
    return responseModel;
  }

  Future<ResponseModel> pooja(
  ) async {
getPoojaList.clear();    isLoading = true;
    update();
    Response response = await authRepo.pooja();
    ResponseModel responseModel = await checkResponseModel(response);
    showCustomSnackBar(responseModel.message, isError: !responseModel.status);
    log(jsonEncode(response.statusCode));
    if (responseModel.status) {



       getPoojaList = poojaModelFromJson(jsonEncode(responseModel.data));
    }
    isLoading = false;
    update();
    return responseModel;
  }

  Future<ResponseModel> banners(
  ) async {
    getBannerList.clear();
    isLoading = true;
    update();
    Response response = await authRepo.banners();
    ResponseModel responseModel = await checkResponseModel(response);
    showCustomSnackBar(responseModel.message, isError: !responseModel.status);
    log(jsonEncode(response.statusCode));
    if (responseModel.status) {



       getBannerList = bannerModelFromJson(jsonEncode(responseModel.data));
    }
    isLoading = false;
    update();
    return responseModel;
  }

  Future<ResponseModel> templeDetails(
  {required String id}
  ) async {

    templeDetailsModel=null;
    isLoading = true;
    update();
    Response response = await authRepo.templeDetails(id);
    ResponseModel responseModel = await checkResponseModel(response);
    showCustomSnackBar(responseModel.message, isError: !responseModel.status);
    log(jsonEncode(response.statusCode));
    if (responseModel.status) {



      templeDetailsModel= templeDetailsModelFromJson(jsonEncode(responseModel.data));
    }
    isLoading = false;
    update();
    return responseModel;
  }

  Future<ResponseModel> registerTemple(Map<String, dynamic> body) async {
    isLoading = true;
    update();
    Response response = await authRepo.registerTemple(body);
    ResponseModel responseModel = await checkResponseModel(response);
    showCustomSnackBar(responseModel.message, isError: !responseModel.status);
    isLoading = false;
    update();
    return responseModel;
  }

  Future<ResponseModel> registerTempleMultipart(Map<String, String> body, List<MultipartBody> multipartBody) async {
    isLoading = true;
    update();
    Response response = await authRepo.registerTempleMultipart(body, multipartBody);
    ResponseModel responseModel = await checkResponseModel(response);
    showCustomSnackBar(responseModel.message, isError: !responseModel.status);
    isLoading = false;
    update();
    return responseModel;
  }

  bool isLoggedIn() {
    return authRepo.isLoggedIn();
  }

  Future<bool> clearSharedData() async {
    return await authRepo.clearSharedData();
  }

  String getUserToken() {
    return authRepo.getUserToken();
  }

  // String getType() {
  //   return authRepo.getType();
  // }
  //
  // Future<bool> saveType(String type) {
  //   return authRepo.saveType(type);
  // }
}
