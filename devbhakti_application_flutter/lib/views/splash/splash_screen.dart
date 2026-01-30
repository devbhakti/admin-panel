import 'dart:async';

import 'package:devbhakti/controller/authcontroller.dart';
import 'package:devbhakti/util/images.dart';
import 'package:devbhakti/views/auth/login.dart';
import 'package:devbhakti/views/auth/registration.dart';
import 'package:devbhakti/views/dashboard/dashboard.dart';
import 'package:devbhakti/views/institution/institute_dashboard.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    Timer(Duration(seconds: 3), () {

      // if (Get.find<AuthController>().isLoggedIn()) {
      //   Get.find<AuthController>().getUser().then((value) {
      //     if (value.status) {
      //       Get.find<AuthController>().userModel!.user!.role == "DEVOTEE"
      //           ? Get.offAll(() => Dashboard())
      //           : Get.offAll(() => InstituteDashboard());
      //     }
      //   });
      // } else {
      //   Get.offAll(() => LoginScreen());
      // }

      Get.offAll(() => LoginScreen());
    });

    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // backgroundColor: Colors.black,
      body: Center(child: Image.asset(Images.logo)),
    );
  }
}
