import 'package:devbhakti/util/dimensions.dart';
import 'package:devbhakti/util/images.dart';
import 'package:flutter/material.dart';
import 'package:get/get_core/src/get_main.dart' show Get;
import 'package:get/get_navigation/src/extension_navigation.dart';

import '../base/drawer.dart';
import '../cart/cart.dart';
import '../dashboard/dashboard.dart';
import '../home/temple_detail.dart';

class LiveDarshan extends StatefulWidget {
  const LiveDarshan({super.key});

  @override
  State<LiveDarshan> createState() => _LiveDarshanState();
}

class _LiveDarshanState extends State<LiveDarshan> with SingleTickerProviderStateMixin{
  List images = [
    "https://devbhakti.koubcafe.in/_next/static/media/temple-kashi.36ab7a78.jpg",
    "https://devbhakti.koubcafe.in/_next/static/media/temple-tirupati.26682397.jpg",
    "https://devbhakti.koubcafe.in/_next/static/media/temple-siddhivinayak.98d2674b.jpg",
    "https://devbhakti.koubcafe.in/_next/static/media/temple-meenakshi.61ecd540.jpg",
  ];
  final List<String> knows = [
    "Moksha",
    "wealth",
    "success",
    "harmonious relationships"
  ];
  List name = [
    "Kashi Vishwanath Temple",
    "Tirupati Balaji Temple",
    "Siddhivinayak Temple",
    "Meenakshi Amman Temple",
  ];

  late AnimationController _controller;
  late Animation<Color?> _colorAnimation;

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..repeat(reverse: true);

    _colorAnimation = ColorTween(
      begin: Colors.red,
      end: Colors.red.withOpacity(0.5),
    ).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,

      // 2. Define the End Drawer
      // endDrawer: ModernDrawer(),
      // appBar: AppBar(
      //   automaticallyImplyLeading: false,
      //   backgroundColor: Get.theme.primaryColor,
      //   title: Text("Live Darshan", style: TextStyle(color: Colors.white)),
      // ),
      appBar: AppBar(
        backgroundColor: Color(0xFFF9F9F9),
        automaticallyImplyLeading: false,
        centerTitle: false,


        title: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: 0,
          ),
          child: Row(
            children: [


              InkWell(onTap: (){
                Get.offAll(()=>Dashboard(index: 2,));
              }, child: Icon(Icons.arrow_back_outlined)),
              // SizedBox(width: 5,),
              // Image.asset(Images.logo2, height: 35),
              SizedBox(width: 15),
              //
              // SizedBox(width: 5,),
              // Image.asset(Images.logo2, height: 35),
              // SizedBox(width: 10),
              Expanded(
                child: Container(
                  height: 40,
                  // padding: EdgeInsets.all(Dimensions.paddingSizeExtraSmall),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadiusGeometry.circular(30),
                    border: Border.all(color: Get.theme.primaryColor),
                  ),
                  child: Row(
                    children: [
                      SizedBox(width: 5,),
                      Image.asset(Images.logo2, height: 35),
                      SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          "Search Temples, Poojas & more…",
                          style: TextStyle(fontSize: 12),
                        ),
                      ),
                      Image.asset(Images.search, height: 26),
                      SizedBox(width: 5,),


                    ],
                  ),
                ),
              ),
              SizedBox(width: 10,),

              Icon(Icons.notifications_none),
              SizedBox(width: 5,),

              InkWell(
                onTap: () => Get.to(() => CartScreen()),
                child: const Icon(Icons.shopping_cart_outlined),
              ),
              SizedBox(width: 5,),

              InkWell(
                  onTap: () => _scaffoldKey.currentState?.openEndDrawer(),
                  child: Image.asset(Images.options,height: 20,)
              ),
            ],
          ),
        ),
        //
        // actions: [
        //   IconButton(
        //     onPressed: () {
        //       Get.to(() => CartScreen());
        //     },
        //     icon: Icon(Icons.shopping_cart_outlined),
        //   ),
        //   IconButton(
        //     // 3. FIX: Change openDrawer() to openEndDrawer()
        //     onPressed: () {
        //       _scaffoldKey.currentState?.openEndDrawer();
        //     },
        //     icon: Icon(Icons.menu),
        //   ),
        // ],
      ),

      body: ListView(
        children: [
          Container(
            height: 300,
            width: 500,
            decoration: BoxDecoration(
              // borderRadius: BorderRadius.circular(12),
            ),
            child: ClipRRect(
              // borderRadius: BorderRadius.circular(12),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  Image.asset(
                    Images.mandir,
                    fit: BoxFit.cover,
                  ),

                  // 🔥 Inner dark shadow
                  Container(
                    decoration: BoxDecoration(
                      gradient: RadialGradient(
                        center: Alignment.center,
                        radius: 0.8,
                        colors: [
                          Colors.transparent,
                          Colors.black.withOpacity(0.45),
                        ],
                      ),
                    ),
                  ),

                  Center(

                    child: Container(
                      height: 50,width: 50,
                      decoration: BoxDecoration(shape: BoxShape.circle,color: Colors.white.withOpacity(0.5)),child: Center(child: Icon(Icons.play_arrow),),),)
                ],
              ),
            ),
          ),




          GridView.builder(
            padding: EdgeInsets.all(Dimensions.paddingSizeDefault),
            shrinkWrap: true,
            physics: ScrollPhysics(), // Prevent nested scrolling issues

            itemCount: name.length, // Add a fixed count for now
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.7,
              crossAxisSpacing: 20,
              mainAxisSpacing: 20,
            ),
            itemBuilder: (context, index) {
              return InkWell(
                onTap: () {
                  // Get.to(
                  //   () => TempleDetail(image: images[index], name: name[index]),
                  // );
                },
                child: Stack(
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(
                          Dimensions.radiusDefault,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey,
                            blurStyle: BlurStyle.outer,
                            blurRadius: 5,
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SizedBox(
                            height: 130,
                            width: Get.width,

                            child: ClipRRect(
                              borderRadius: BorderRadiusGeometry.only(
                                topLeft: Radius.circular(Dimensions.radiusDefault),
                                topRight: Radius.circular(Dimensions.radiusDefault),
                              ),
                              child: Image.network(
                                images[index],
                                fit: BoxFit.cover,
                              ),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  name[index],
                                  style: TextStyle(
                                    color: Colors.black,
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                  maxLines: 1,
                                ),
                                SizedBox(height: 5),
                                Text(
                                  "Temple is Known For ${knows[index]}",
                                  style: const TextStyle(
                                    color: Colors.black,
                                    fontSize: 12,
                                    // fontWeight: FontWeight.bold,
                                  ),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                Row(
                                  children: [
                                    Icon(
                                      Icons.location_on_outlined,
                                      color: Colors.grey,
                                      size: 16,
                                    ),
                                    Text("varanasi UP",style: TextStyle(fontSize: 12),),
                                  ],
                                ),

                                SizedBox(height: 5),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        Icon(Icons.star, color: Colors.yellow),
                                        Row(
                                          children: [
                                            Text("4.9 "),
                                            Text(
                                              "(12,500)",
                                              style: TextStyle(color: Colors.grey),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                    // Row(
                                    //   children: [
                                    //     Icon(Icons.watch_later_outlined),
                                    //     Text(" 04:00 AM"),
                                    //   ],
                                    // ),
                                  ],
                                ),
                              ],
                            ),
                          ),

                        ],
                      ),
                    ),
                    Positioned(
                      top: 15,
                      right: 10,
                      child: Container(
                        padding: EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: Get.theme.scaffoldBackgroundColor,
                          borderRadius: BorderRadius.circular(15),
                        ),
                        child: Center(child: Row(
                          children: [
                            Icon(Icons.group,size: 15,),
                            Text("  500 Viewers",style: TextStyle(fontSize: 10),),
                          ],
                        )),
                      ),
                    ),   Positioned(
                      top: 15,
                      left: 10,
                      child:AnimatedBuilder(
                        animation: _colorAnimation,
                        builder: (context, child) {
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: _colorAnimation.value,
                              borderRadius: BorderRadius.circular(15),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: const [
                                CircleAvatar(
                                  backgroundColor: Colors.white,
                                  radius: 5,
                                ),
                                SizedBox(width: 4),
                                Text(
                                  "Live",
                                  style: TextStyle(fontSize: 12, color: Colors.white),
                                ),
                              ],
                            ),
                          );
                        },
                      )
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
