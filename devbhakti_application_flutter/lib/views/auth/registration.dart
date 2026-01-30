import 'package:devbhakti/controller/authcontroller.dart';
import 'package:devbhakti/util/dimensions.dart';
import 'package:devbhakti/util/images.dart';
import 'package:devbhakti/views/auth/login.dart';
import 'package:devbhakti/views/auth/otp.dart';
import 'package:devbhakti/views/base/button.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get/get_connect/http/src/utils/utils.dart';

import '../base/input_field1.dart';

class RegistrationScreen extends StatefulWidget {
  const RegistrationScreen({super.key});

  @override
  State<RegistrationScreen> createState() => _RegistrationScreenState();
}

class _RegistrationScreenState extends State<RegistrationScreen> {
  TextEditingController phoneController=TextEditingController();
  TextEditingController nameController=TextEditingController();

  int selected=0;
  @override
  Widget build(BuildContext context) {
    return Scaffold(

        body: Stack(children: [


          SizedBox(
              height: Get.height, width: Get.width,
              child: ClipRRect(

                  child: Image.asset(Images.login,fit: BoxFit.cover,))),

          SizedBox(
              height: Get.height, width: Get.width,
              child: Container(color: Colors.white.withOpacity(0.7),)),
          Positioned(
            bottom: 50,right: 0,left: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [Text("Already have an account?",style: TextStyle(fontSize: 16),),InkWell(
                  onTap: (){
                    Get.to(()=>LoginScreen());
                  },
                  child: Text(" Sign In",style: TextStyle(fontSize: 16,color: Get.theme.primaryColor),)),],),
          ),

          SizedBox(
            height: Get.height,width: Get.width,
            child: Center(child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Image.asset(Images.logo,height: 100,),
                Text("Create Your Account",style: TextStyle(fontSize: 20,fontWeight: FontWeight.bold,color: Get.theme.primaryColor),),
                Text("Join DevBhakti and connect with sacred temples",style:
                TextStyle(fontSize: 16,color: Get.theme.primaryColor.withOpacity(0.5)),),
                SizedBox(height: 10,),
                //
                // Container(
                //   padding: EdgeInsets.all(5),
                //   margin: EdgeInsets.symmetric(horizontal: 16),
                //   decoration: BoxDecoration(borderRadius: BorderRadiusGeometry.circular(Dimensions.radiusSmall),color: Colors.grey.withOpacity(0.5)),child: Row(
                //
                //   children: [
                //     Expanded(child: InkWell(
                //       onTap: (){
                //         setState(() {
                //           selected=0;
                //         });
                //       },
                //       child: Container(
                //         height:40,
                //         decoration: BoxDecoration(borderRadius: BorderRadiusGeometry.circular(Dimensions.radiusSmall),color:selected==0? Colors.white:null),child: Center(child: Row(mainAxisAlignment: MainAxisAlignment.center,
                //           children: [
                //             Icon(Icons.person,color: selected==0?Colors.black:Colors.grey,),
                //             Text(" User",style: TextStyle(color:selected==0? Colors.black:Colors.black.withOpacity(0.8)),),
                //           ],
                //         )),),
                //     )),
                //
                //     Expanded(child: InkWell(
                //       onTap: (){
                //         setState(() {
                //           selected=1;
                //         });
                //       },
                //       child: Container(
                //         height:40,
                //         decoration: BoxDecoration(borderRadius: BorderRadiusGeometry.circular(Dimensions.radiusSmall),color:selected==1? Colors.white:null),child: Center(child: Row(mainAxisAlignment: MainAxisAlignment.center,
                //           children: [
                //             Image.asset(Images.temple,height: 20,color: selected==1?Colors.black:Colors.grey,),
                //             Text(" Temple",style: TextStyle(color:selected==1? Colors.black:Colors.black.withOpacity(0.8)),),
                //
                //           ],
                //         )),),
                //     )),
                //   ],
                // ),),
                // SizedBox(height: 10,),

              selected==0?  Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 18.0),
                  child: InputField1(title: "Enter your name", controller: nameController,subtitle: "Full Name",),
                ):
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 18.0),
                child: InputField1(title: "Enter temple name", controller: nameController,subtitle: "Temple/Institution Name",),
              ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 18.0),
                  child: InputField1(title: "+91 XXXXXXXXXX", controller: phoneController,subtitle: "Phone Number",),
                ),

                SizedBox(height: 20,),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 18.0),
                  child: Button(title: "Create Account & Send OTP", onTap: (){
                    save();
                  }),
                )


              ],),),
          ),
        ],)
    );
  }
  save(){
    Get.find<AuthController>().userRegister(phone: "+91"+phoneController.text, name: nameController.text).then((value){
      Get.to(()=>OtpScreen(phone: "+91"+phoneController.text, role: "DEVOTEE",));

    });
  }
}
