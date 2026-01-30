import 'package:devbhakti/util/dimensions.dart';
import 'package:devbhakti/views/base/button.dart';
import 'package:devbhakti/views/donation/donation_purpose.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get/get_connect/http/src/utils/utils.dart';

class DonationScreen extends StatefulWidget {
  const DonationScreen({super.key});

  @override
  State<DonationScreen> createState() => _DonationScreenState();
}

class _DonationScreenState extends State<DonationScreen> {
  int selectedIndex = -1;
  List templeName = [
    "Kashi Vishwanath Temple",

    "Tirupati Balaji Temple",

    "Siddhivinayak Temple",

    "Meenakshi Temple",

    "Jagannath Temple",

    "Somnath Temple",
  ];

  List location=[
    "Varanasi, UP",



    "Tirupati, AP"
,


    "Mumbai, MH",



    "Madurai, TN",



    "Puri, Odisha",



    "Gujarat",
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Get.theme.primaryColor,
        iconTheme: IconThemeData(color: Colors.white),
        title: Text(

          "Make a Donation",
          style: TextStyle(color: Colors.white, fontFamily: 'Georgia'),
        ),
      ),
      body: ListView(
        padding: EdgeInsets.all(Dimensions.paddingSizeDefault),
        children: [
          Text(
            "Select Temple to Donate",
            style: TextStyle(
              fontSize: 24,
              color: Get.theme.primaryColor,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            "Choose the temple you wish to support",
            style: TextStyle(color: Get.theme.primaryColor.withOpacity(0.5)),
          ),
          SizedBox(height: 10,),

          ListView.builder(
            shrinkWrap: true,
            itemCount: templeName.length,
            itemBuilder: (context, index) {
              return InkWell(
                onTap: () {
                  setState(() {
                    selectedIndex = index;
                  });
                },
                child: Container(
                  padding: EdgeInsets.all(Dimensions.paddingSizeSmall),
                  margin: const EdgeInsets.only(bottom: 10),
                  decoration: BoxDecoration(
                    border: Border.all(
                      color: selectedIndex == index
                          ? Get.theme.primaryColor
                          : Colors.grey,
                    ),
                    color: selectedIndex == index
                        ? Get.theme.primaryColor.withOpacity(0.2)
                        : Colors.transparent,
                    borderRadius:
                    BorderRadius.circular(Dimensions.radiusDefault),
                  ),
                  child: Row(
                    children: [
                      // RADIO BUTTON
                      Radio<int>(
                        value: index,
                        groupValue: selectedIndex,
                        activeColor: Get.theme.primaryColor,
                        onChanged: (value) {
                          setState(() {
                            selectedIndex = value!;
                          });
                        },
                      ),

                      // TEXT CONTENT
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            templeName[index],
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          Text(location[index]),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
          SizedBox(height: 10,),
      selectedIndex==-1?SizedBox():    Button(title: "Next", onTap: (){
        Get.to(()=>DonationPurpose());
      })

        ],
      ),
    );
  }
}
