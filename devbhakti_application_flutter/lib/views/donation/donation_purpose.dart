import 'package:devbhakti/util/dimensions.dart';
import 'package:devbhakti/views/base/input_field1.dart';
import 'package:devbhakti/views/donation/doner_info.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../base/button.dart';

class DonationPurpose extends StatefulWidget {
  const DonationPurpose({super.key});

  @override
  State<DonationPurpose> createState() => _DonationPurposeState();
}

class _DonationPurposeState extends State<DonationPurpose> {

  TextEditingController amountController=TextEditingController();
  List name = [
    "General Donation",

    "Annadaan (Food Seva)",

    "Gau Seva",

    "Education Fund",

    "Temple Renovation",
  ];

  int selectedIndex = -1;
  int selectedAmount = -1;

  List description = [
    "Support temple operations and maintenance",

    "Feed devotees and the needy",

    "Support cow welfare programs",

    "Support vedic education initiatives",

    "Help maintain and beautify the temple",
  ];



  List amount=[

"₹101",
  "₹251",
  "₹501",
 "₹1,001",
 "₹2,101",
 "₹5,001",
 "₹11,001",
 "₹21,001",
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

          Container(
            padding: EdgeInsets.all(Dimensions.paddingSizeDefault),
          decoration: BoxDecoration( 
            
            
            borderRadius: BorderRadius.circular(Dimensions.radiusDefault),
            color: Colors.white,),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start,
              children: [

                Row(
                  children: [

                    Icon(Icons.card_giftcard,color: Get.theme.primaryColor,),
                    Text(
                      " Donation Purpose",
                      style: TextStyle(
                        fontSize: 24,
                        color: Get.theme.primaryColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),

                SizedBox(height: 10,),
                ListView.builder(
                  physics: NeverScrollableScrollPhysics(),

                  shrinkWrap: true,
                  itemCount: name.length,
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
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    name[index],
                                    style: const TextStyle(fontWeight: FontWeight.bold),
                                  ),
                                  Text(description[index]),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
          SizedBox(height: 20,), Container(
            padding: EdgeInsets.all(Dimensions.paddingSizeDefault),
          decoration: BoxDecoration(


            borderRadius: BorderRadius.circular(Dimensions.radiusDefault),
            color: Colors.white,),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start,
              children: [

                Row(
                  children: [

                    Text(
                      "₹ Donation Amount",
                      style: TextStyle(
                        fontSize: 24,
                        color: Get.theme.primaryColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),

                SizedBox(height: 10,),
                GridView.builder(
                  shrinkWrap: true,
                  itemCount: amount.length,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    childAspectRatio: 2,
                    mainAxisSpacing: 10,
                    crossAxisSpacing: 10,
                  ),
                  itemBuilder: (context, index) {
                    final bool isSelected = selectedAmount == index;

                    return InkWell(
                      onTap: () {
                        setState(() {
                          selectedAmount = index;
                        });
                      },
                      child: Container(
                        decoration: BoxDecoration(
                          color: isSelected
                              ? Get.theme.primaryColor
                              : Get.theme.primaryColor.withOpacity(0.3),
                          borderRadius:
                          BorderRadius.circular(Dimensions.radiusDefault),
                          border: Border.all(
                            color: isSelected
                                ? Get.theme.primaryColor
                                : Colors.transparent,
                            width: 2,
                          ),
                        ),
                        child: Center(
                          child: Text(
                            amount[index],
                            style: TextStyle(
                              color: isSelected ? Colors.white : Colors.black,
                              fontSize: 16,
                              fontWeight:
                              isSelected ? FontWeight.bold : FontWeight.normal,
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),

                SizedBox(height: 15,),


                Text("Or Enter Custom Amount"),
                InputField1(
                  title: "Enter amount",
                  controller: amountController,
                  onChanged: (value) {
                    if (value.isNotEmpty) {
                      setState(() {
                        selectedAmount = -1;
                      });
                    }
                  },
                )


,
                SizedBox(height: 20,),
                if (selectedAmount != -1)
                  Text(
                    "Selected Price: ${amount[selectedAmount]}",
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Get.theme.primaryColor,
                    ),
                  ),
              ],
            ),
          ),
          SizedBox(height: 20,),
          Button(title: "Next", onTap: (){
            Get.to(()=>DonerInfo());
          })
        ],
      ),
    );
  }
}
