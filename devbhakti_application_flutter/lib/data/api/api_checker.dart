import 'dart:convert';
import 'dart:developer';
import 'package:get/get.dart';
import '../../controller/authcontroller.dart';
import '../../views/base/custom_snackbar.dart';
import '../../views/splash/splash_screen.dart';
import '../model/base/response_model.dart';

Future<ResponseModel> checkResponseModel(Response response) async {
  log("Status Code: ${response.statusCode}");
  log("Status Text: ${response.statusText}");
  log("Body: ${json.encode(response.body)}");

  if (response.statusCode == 401) {
    await Get.find<AuthController>().clearSharedData();
    Get.offAll(() => const SplashScreen());
    showCustomSnackBar('Auth Failed', isError: true);
    return ResponseModel(
      false,
      'Unauthorized',
      null,
    );
  }

  if (response.statusCode == 200 || response.statusCode == 201) {
    if (response.body != null && response.body is Map && (response.body['success'] == true || response.body['status'] == 'success')) {
      return ResponseModel(
        true,
        response.body['message'] ?? '',
        response.body['data'],
      );
    } else {
      return ResponseModel(
        false,
        (response.body != null && response.body is Map) ? (response.body['message'] ?? 'Error occurred') : 'Invalid response from server',
        null,
      );
    }
  } else {
    String errorMessage = 'Internal Server Error';
    if (response.statusCode == null || response.statusCode == 0) {
      errorMessage = 'Connection failed. Please check your internet connection.';
    } else if (response.body != null && response.body is Map) {
      errorMessage = response.body['message'] ?? 'Internal Server Error :${response.statusCode}';
    } else {
      errorMessage = 'Internal Server Error :${response.statusCode}';
    }

    showCustomSnackBar(errorMessage, isError: true);
    return ResponseModel(
      false,
      errorMessage,
      null,
    );
  }
}
