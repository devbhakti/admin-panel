import 'package:devbhakti/util/dimensions.dart';
import 'package:devbhakti/views/base/successfull_donation.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../base/button.dart';

class DonationSummary extends StatefulWidget {
  const DonationSummary({super.key});

  @override
  State<DonationSummary> createState() => _DonationSummaryState();
}

class _DonationSummaryState extends State<DonationSummary> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(backgroundColor: Get.theme.scaffoldBackgroundColor,),
      body: ListView(
        padding: EdgeInsets.all(Dimensions.paddingSizeDefault),
        children: [
          Container(
            padding: EdgeInsets.all(Dimensions.paddingSizeDefault),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(Dimensions.radiusDefault),
              color: Colors.white,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Donation Summary",
                  style: TextStyle(
                    fontFamily: 'Georgia',

                    fontSize: 24,
                    color: Get.theme.primaryColor,
                  ),
                ),
                SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "Temple",
                      style: TextStyle(color: Colors.black.withOpacity(0.5)),
                    ),
                    Text(
                      "Kashi Vishwanath Temple",
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),

                Divider(),
                SizedBox(height: 20),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "Purpose",
                      style: TextStyle(color: Colors.black.withOpacity(0.5)),
                    ),
                    Text(
                      "Gau Seva",
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                Divider(),
                SizedBox(height: 20),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "Donor Name",
                      style: TextStyle(color: Colors.black.withOpacity(0.5)),
                    ),
                    Text(
                      "Pratham",
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),

                Divider(),
                SizedBox(height: 20),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "Donation Amount",
                      style: TextStyle(
                        color: Colors.black,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    Text(
                      "₹500",
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),

                SizedBox(height: 25),

                InkWell(onTap: (){
                  showDialog(context: context, builder: (context){
                    return SuccessfullDonation();
                  });
                },
                  child: Container(
                    height: 50,
                    decoration: BoxDecoration(
                      color: Colors.green,
                      borderRadius: BorderRadius.circular(Dimensions.radiusLarge),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          "Complete Donation ₹501",
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
