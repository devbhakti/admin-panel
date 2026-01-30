import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../util/dimensions.dart';

void showCustomSnackBar(String message, {bool isError = false}) {
  if (message.isNotEmpty) {
    Get.showSnackbar(GetSnackBar(
      message: message,
      dismissDirection: DismissDirection.horizontal,
      margin: const EdgeInsets.all(Dimensions.paddingSizeSmall),
      duration: const Duration(seconds: 3),
      backgroundColor: isError ? Colors.red : Colors.green,
    ));
  }
}
