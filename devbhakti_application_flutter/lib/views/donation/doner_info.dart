import 'package:devbhakti/util/dimensions.dart';
import 'package:devbhakti/views/base/button.dart';
import 'package:devbhakti/views/base/input_field1.dart';
import 'package:devbhakti/views/donation/donation_summary.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class DonerInfo extends StatefulWidget {
  const DonerInfo({super.key});

  @override
  State<DonerInfo> createState() => _DonerInfoState();
}

class _DonerInfoState extends State<DonerInfo> {
  TextEditingController nameController=TextEditingController();
  TextEditingController phoneController=TextEditingController();
  TextEditingController emailController=TextEditingController();
  TextEditingController addressController=TextEditingController();
  TextEditingController messageController=TextEditingController();
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(backgroundColor: Get.theme.scaffoldBackgroundColor,),
      body: ListView(padding: EdgeInsets.all(Dimensions.paddingSizeDefault),children: [


        Container(
          padding: EdgeInsets.all(Dimensions.paddingSizeDefault),
          decoration: BoxDecoration(


            borderRadius: BorderRadius.circular(Dimensions.radiusDefault),
            color: Colors.white,),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start,
            children: [

              Text(
                "Donor Information",
                style: TextStyle(
                  fontFamily: 'Georgia',

                  fontSize: 24,
                  color: Get.theme.primaryColor,
                ),
              ),   Text(
                "Please provide your details for the donation receipt",
                style: TextStyle(

                  fontSize: 14,
                  color: Get.theme.primaryColor.withOpacity(0.5),
                ),
              ),

              SizedBox(height: 10,),

              InputField1(title: "Enter your first name", controller: nameController,subtitle: "Full Name *",),
              InputField1(title: "Enter your first name", controller: phoneController,subtitle: "Phone Number *",),
              InputField1(title: "Enter email address", controller: emailController,subtitle: "Email Address *",),
              InputField1(title: "Enter your address", controller: addressController,subtitle: "Address (Optional)",),
              InputField1(title: "Add a personal message or prayer request", controller: messageController,subtitle: "Message / Prayer Request (Optional)",),

          SizedBox(height: 20,),
          Button(title: "Next", onTap: (){
            Get.to(()=>DonationSummary());
          })

            ],
          ),
        ),

      ],),
    );
  }
}
