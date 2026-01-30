import 'package:devbhakti/util/dimensions.dart';
import 'package:devbhakti/views/base/button.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class AartiDetailScreen extends StatefulWidget {
  const AartiDetailScreen({super.key});

  @override
  State<AartiDetailScreen> createState() => _AartiDetailScreenState();
}

class _AartiDetailScreenState extends State<AartiDetailScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        iconTheme: IconThemeData(color: Colors.white),
        backgroundColor: Get.theme.primaryColor,title: Text("Mangala Aarti",style: TextStyle(color: Colors.white),),),
      body: ListView(padding: EdgeInsets.all(Dimensions.paddingSizeDefault),children: [
        Container(
          padding: EdgeInsets.all(Dimensions.paddingSizeDefault),
            decoration: BoxDecoration(color: Colors.white,borderRadius: BorderRadius.circular(Dimensions.radiusLarge),boxShadow: [
              BoxShadow(color: Colors.grey,blurStyle: BlurStyle.outer,blurRadius: 5)
            ]),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("Mangala Aarti",style: TextStyle(fontSize: 24,color: Get.theme.primaryColor,fontWeight: FontWeight.bold,
                  fontFamily: 'Georgia',
                ),),
                SizedBox(height: 10,),
                Text("Benifits:-",style: TextStyle(fontSize: 16,color: Get.theme.primaryColor,fontWeight: FontWeight.bold),),

                Text("Marriage, Love Life, Kids, Ancestors, Prosperity, Home, Vehicle, Travel, Studies, Health, Parents, Courage, Peace, Safety etc"),
                SizedBox(height: 10,),


                Text(
                  "Price:- ₹200",
                  style: TextStyle(
                    fontSize: 16,
                    color: Get.theme.primaryColor,
                  ),
                ),
              ],
            )),
        SizedBox(height: 20,),
        Button(title: "Book", onTap: (){})
      ],),
    );
  }
}
