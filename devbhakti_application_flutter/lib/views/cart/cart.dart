import 'package:devbhakti/util/dimensions.dart';
import 'package:devbhakti/views/bookings/successfull_booking.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'order_successfull.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  int count = 1;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        iconTheme: IconThemeData(color: Colors.white),

        backgroundColor: Get.theme.primaryColor,
        title: Text("Cart", style: TextStyle(color: Colors.white)),
      ),

      bottomNavigationBar: SizedBox(
        height: 200,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text("Subtotal"),
                  Text("₹149", style: TextStyle(fontSize: 16)),
                ],
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text("Shipping"),
                  Text("₹49", style: TextStyle(fontSize: 16)),
                ],
              ),   Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text("Platform fees"),
                  Text("₹49", style: TextStyle(fontSize: 16)),
                ],
              ),
              Divider(color: Get.theme.primaryColor, thickness: 1),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text("Total"),
                  Text("₹274", style: TextStyle(fontSize: 16)),
                ],
              ),

              SizedBox(height: 10),

              InkWell(
                onTap: (){
                  showDialog(context: context, builder: (context){return
                    OrderSuccessfull();
                  });
                },
                child: Container(
                  height: 50,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(Dimensions.radiusDefault),
                    color: Get.theme.primaryColor,
                  ),
                  child: Center(
                    child: Text(
                      "Proceed to Checkout",
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      body: ListView(
        padding: EdgeInsets.all(Dimensions.paddingSizeDefault),
        children: [
          Stack(
            children: [
              Container(
                padding: EdgeInsets.all(Dimensions.paddingSizeSmall),

                decoration: BoxDecoration(
                  color: Get.theme.primaryColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(Dimensions.radiusDefault),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(
                      height: 100,
                      width: 100,
                      child: ClipRRect(
                        borderRadius: BorderRadiusGeometry.circular(
                          Dimensions.radiusDefault,
                        ),
                        child: Image.network(
                          "https://devbhakti.koubcafe.in/_next/static/media/temple-kashi.36ab7a78.jpg",
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Holy Gangajal",
                          style: TextStyle(fontSize: 18, fontFamily: 'Georgia'),
                        ),
                        SizedBox(height: 5),
                        Text("₹149", style: TextStyle(fontSize: 16)),

                        SizedBox(height: 10),

                        Row(
                          children: [
                            // ADD BUTTON
                            InkWell(
                              onTap: () {
                                setState(() {
                                  count++;
                                });
                              },
                              child: CircleAvatar(
                                radius: 15,
                                backgroundColor: Get.theme.primaryColor,
                                child: const Icon(
                                  Icons.add,
                                  color: Colors.white,
                                ),
                              ),
                            ),

                            const SizedBox(width: 10),

                            // COUNT TEXT
                            Text(
                              count.toString(),
                              style: const TextStyle(fontSize: 16),
                            ),

                            const SizedBox(width: 10),

                            // MINUS BUTTON
                            InkWell(
                              onTap: () {
                                if (count > 1) {
                                  setState(() {
                                    count--;
                                  });
                                }
                              },
                              child: CircleAvatar(
                                radius: 15,
                                backgroundColor: Get.theme.primaryColor,
                                child: const Text(
                                  "-",
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 20,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              Positioned(
                right: 10,
                bottom: 20,
                child: Icon(Icons.delete, color: Get.theme.primaryColor),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
