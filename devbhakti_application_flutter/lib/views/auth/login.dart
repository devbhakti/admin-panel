import 'package:devbhakti/controller/authcontroller.dart';
import 'package:devbhakti/util/images.dart';
import 'package:devbhakti/views/auth/otp.dart';
import 'package:devbhakti/views/auth/registration.dart';
import 'package:devbhakti/views/auth/temple_login.dart';
import 'package:devbhakti/views/base/button.dart';
import 'package:devbhakti/views/base/input_field1.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
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
            bottom: 70,
            right: 0,
            left: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text("Don't have an account?", style: TextStyle(fontSize: 16)),
                InkWell(
                  onTap: () {
                    Get.to(() => RegistrationScreen());
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
          Positioned(
            bottom: 40,
            right: 0,
            left: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text("Login as temple?", style: TextStyle(fontSize: 16)),
                InkWell(
                  onTap: () {
                    Get.to(() => TempleLogin());
                  },
                  child: Text(
                    " Login",
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
                    "Welcome Back",
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Get.theme.primaryColor,
                    ),
                  ),
                  Text(
                    "Sign in to continue your spiritual journey",
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
                      maxLength: 10,
                      keyboardType: TextInputType.number,
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(18.0),
                    child: Button(
                      title: "Send OTP",
                      onTap: () {
                        save();
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

    Get.find<AuthController>().sendOtp(phone: "+91"+phoneController.text,role: "DEVOTEE" ).then((value){
      if(value.status){
        Get.to(() => OtpScreen(phone: "+91"+phoneController.text,role: "DEVOTEE",));

      }
    });
  }
}
