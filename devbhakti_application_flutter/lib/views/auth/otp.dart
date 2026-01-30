import 'package:devbhakti/controller/authcontroller.dart';
import 'package:devbhakti/views/auth/login.dart';
import 'package:devbhakti/views/dashboard/dashboard.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:pin_code_fields/pin_code_fields.dart';

import '../../util/images.dart';
import '../base/button.dart';
import '../base/custom_snackbar.dart';
import '../base/input_field1.dart';
import '../institution/institute_dashboard.dart';

class OtpScreen extends StatefulWidget {
  final String? phone;
  final String? role;

  const OtpScreen({super.key, this.phone, this.role});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  TextEditingController pinController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // body: Center(child: Column(
      //   mainAxisAlignment: MainAxisAlignment.center,
      //   children: [
      //     Image.asset(Images.logo,height: 100,),
      //     Text("Welcome Back",style: TextStyle(fontSize: 20,fontWeight: FontWeight.bold,color: Get.theme.primaryColor),),
      //     Text("Enter your OTP code number",style:
      //     TextStyle(fontSize: 16,color: Get.theme.primaryColor.withOpacity(0.5)),),
      //
      //
      //     SizedBox(height: 20,),
      //     Padding(
      //       padding: const EdgeInsets.symmetric(horizontal: 18.0,vertical: 20),
      //       child: PinCodeTextField(
      //         appContext: context,
      //         controller: pinController,
      //         length: 6,
      //         keyboardType: TextInputType.number,
      //         inputFormatters: [
      //           FilteringTextInputFormatter.digitsOnly
      //         ],
      //         textStyle: const TextStyle(
      //           fontSize: 20,
      //           fontWeight: FontWeight.bold,
      //           color: Colors.black,
      //         ),
      //         pinTheme: PinTheme(
      //           shape: PinCodeFieldShape.box,
      //           borderRadius: BorderRadius.circular(12),
      //           fieldHeight: 55,
      //           fieldWidth: 45,
      //           activeFillColor: Colors.white,
      //           inactiveFillColor: Colors.transparent,
      //           selectedFillColor: Colors.white,
      //           activeColor: Get.theme.primaryColor,
      //           inactiveColor: Get.theme.primaryColor,
      //           selectedColor: Get.theme.primaryColor,
      //         ),
      //         enableActiveFill: true,
      //         animationDuration: const Duration(milliseconds: 300),
      //         animationCurve: Curves.easeInOut,
      //         onChanged: (value) {
      //           // Auto-verify when all digits are entered
      //           // if (value.length == 6) {
      //           //   // verifyOtp();
      //           // }
      //         },
      //       ),
      //     ),
      //
      //     Button(title: "Send Otp", onTap: (){
      //
      //       Get.to(()=>Dashboard());
      //     })
      //
      //     // Padding(
      //     //   padding: const EdgeInsets.symmetric(horizontal: 18.0),
      //     //   child: Button(title: "Send OTP", onTap: (){
      //     //     print("object");
      //     //     Get.offAll(()=>Dashboard());
      //     //   }),
      //     // ),
      //   ],),),
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

          SizedBox(
            height: Get.height,
            width: Get.width,
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Image.asset(Images.logo, height: 100),
                  Text(
                    "Enter your OTP code number",
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Get.theme.primaryColor,
                    ),
                  ),

                  Text(Get.find<AuthController>().otp.toString()),

                  SizedBox(height: 20),
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 18.0,
                      vertical: 20,
                    ),
                    child: PinCodeTextField(
                      appContext: context,
                      controller: pinController,
                      length: 6,
                      keyboardType: TextInputType.number,
                      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                      textStyle: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.black,
                      ),
                      pinTheme: PinTheme(
                        shape: PinCodeFieldShape.box,
                        borderRadius: BorderRadius.circular(12),
                        fieldHeight: 55,
                        fieldWidth: 45,
                        activeFillColor: Colors.white,
                        inactiveFillColor: Colors.transparent,
                        selectedFillColor: Colors.white,
                        activeColor: Get.theme.primaryColor,
                        inactiveColor: Get.theme.primaryColor,
                        selectedColor: Get.theme.primaryColor,
                      ),
                      enableActiveFill: true,
                      animationDuration: const Duration(milliseconds: 300),
                      animationCurve: Curves.easeInOut,
                      onChanged: (value) {
                        // Auto-verify when all digits are entered
                        // if (value.length == 6) {
                        //   // verifyOtp();
                        // }
                      },
                    ),
                  ),

                  Padding(
                    padding: const EdgeInsets.all(18.0),
                    child: Button(
                      title: "Verify OTP",
                      onTap: () {
                        print("onTap is working---");
                        if (pinController.text.length < 6) {
                          showCustomSnackBar("Please enter a valid 6-digit OTP", isError: true);
                          return;
                        }
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

  save() {
    print("HERE----");
    Get.find<AuthController>()
        .verifyOtp(
          phone: widget.phone.toString(),
          otp: pinController.text,
          role: widget.role ?? "DEVOTEE",
        )
        .then((value) {
          if (value.status) {
            print("in this----");
            widget.role == "INSTITUTION"
                ? Get.to(() => InstituteDashboard())
                : Get.to(() => Dashboard());
          } else {
            print("verifyOtp status is false: ${value.message}");
          }
        });
  }
}
