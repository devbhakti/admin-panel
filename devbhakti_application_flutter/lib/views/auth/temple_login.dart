import 'package:devbhakti/util/images.dart';
import 'package:devbhakti/views/auth/otp.dart';
import 'package:devbhakti/views/auth/register_temple.dart';
import 'package:devbhakti/views/auth/registration.dart';
import 'package:devbhakti/views/base/button.dart';
import 'package:devbhakti/views/base/input_field1.dart';
import 'package:devbhakti/views/institution/institute_dashboard.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../controller/authcontroller.dart';

class TempleLogin extends StatefulWidget {
  const TempleLogin({super.key});

  @override
  State<TempleLogin> createState() => _TempleLoginState();
}

class _TempleLoginState extends State<TempleLogin> {
  TextEditingController phoneController = TextEditingController();
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          SizedBox(
            height: Get.height,
            width: Get.width,
            child: ClipRRect(
              child: Image.asset(Images.login, fit: BoxFit.cover),
            ),
          ),

          SizedBox(
            height: Get.height,
            width: Get.width,
            child: Container(color: Colors.white.withOpacity(0.7)),
          ),
          Positioned(
            bottom: 50,
            right: 0,
            left: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text("Don't have an account?", style: TextStyle(fontSize: 16)),
                InkWell(
                  onTap: () {
                    Get.to(() => RegisterTemple());
                  },
                  child: Text(
                    " Sign Up",
                    style: TextStyle(
                      fontSize: 16,
                      color: Get.theme.primaryColor,
                    ),
                  ),
                ),
              ],
            ),
          ),

          SizedBox(
            height: Get.height,
            width: Get.width,
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Image.asset(Images.logo, height: 100),
                  Text(
                    "Welcome",
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Get.theme.primaryColor,
                    ),
                  ),
                  Text(
                    "Sign in to access temple services",
                    style: TextStyle(
                      fontSize: 16,
                      color: Get.theme.primaryColor.withOpacity(0.5),
                    ),
                  ),

                  Padding(
                    padding: const EdgeInsets.all(18.0),
                    child: InputField1(
                      title: "Enter Phone Number",
                      controller: phoneController,
                      subtitle: "Phone",
                      keyboardType: TextInputType.number,
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(18.0),
                    child: Button(
                      title: "Send OTP",
                      onTap: () {
                        save();
                        // Get.to(() => InstituteDashboard());
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
  save(){

    Get.find<AuthController>().sendOtp(phone: "+91"+phoneController.text,role: "INSTITUTION" ).then((value){
      if(value.status){
        Get.to(() => OtpScreen(phone: "+91"+phoneController.text,role: "INSTITUTION",));

      }
    });
  }

}
