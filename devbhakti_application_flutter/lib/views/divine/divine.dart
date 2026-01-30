import 'package:devbhakti/views/cart/cart.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';


import '../../util/dimensions.dart';
import '../../util/images.dart';
import '../base/drawer.dart';
import '../dashboard/dashboard.dart';

class DivineScreen extends StatefulWidget {
  const DivineScreen({super.key});

  @override
  State<DivineScreen> createState() => _DivineScreenState();
}

class _DivineScreenState extends State<DivineScreen> {

  List images = [
    "https://devbhakti.koubcafe.in/_next/static/media/product-rudraksha.24797be6.jpg",
        "https://devbhakti.koubcafe.in/_next/static/media/product-diya.af1183ee.jpg",
     "https://devbhakti.koubcafe.in/_next/static/media/product-incense.341bb1a5.jpg",
    "https://devbhakti.koubcafe.in/_next/static/media/product-gangajal.0b3fa203.jpg",
    "https://devbhakti.koubcafe.in/_next/static/media/product-gangajal.0b3fa203.jpg",
  ];


  List name = [
    "Sacred Rudraksha Mala",
    "Traditional Brass Diya",
    "Premium Incense Sticks",
    "Holy Gangajal",
    "Holy Gangajal",
  ];


  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    final Size size = MediaQuery.of(context).size;

    final double itemWidth = (size.width - 45) / 2;
    final double itemHeight = 436;
    return Scaffold(
      key: _scaffoldKey,
      // endDrawer: ModernDrawer(),


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

      backgroundColor: const Color(0xFFF9F9F9),
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // SliverToBoxAdapter(
            //   child: Padding(
            //     padding: const EdgeInsets.all(Dimensions.paddingSizeDefault),
            //     child: Column(
            //       children: [
            //         // Row(
            //         //   children: [
            //         //     CircleAvatar(
            //         //       backgroundColor: Get.theme.primaryColor,
            //         //       child: const Center(
            //         //         child: Text("PG", style: TextStyle(color: Colors.white)),
            //         //       ),
            //         //     ),
            //         //     const SizedBox(width: 12),
            //         //     Expanded(
            //         //       child: Text(
            //         //         'Devotional Products',
            //         //         style: TextStyle(
            //         //           fontFamily: 'Georgia',
            //         //           fontWeight: FontWeight.bold,
            //         //           color: Get.theme.primaryColor,
            //         //           fontSize: 18,
            //         //         ),
            //         //       ),
            //         //     ),
            //         //     IconButton(
            //         //       onPressed: () => Get.to(() => CartScreen()),
            //         //       icon: const Icon(Icons.shopping_cart_outlined),
            //         //     ),
            //         //     IconButton(
            //         //       onPressed: () => _scaffoldKey.currentState?.openEndDrawer(),
            //         //       icon: const Icon(Icons.menu),
            //         //     ),
            //         //   ],
            //         // ),
            //       ],
            //     ),
            //   ),
            // ),

            // SliverPersistentHeader(
            //   pinned: true,
            //   delegate: SearchHeaderDelegate(
            //     child: Padding(
            //       padding: const EdgeInsets.symmetric(
            //         horizontal: Dimensions.paddingSizeDefault,
            //       ),
            //       child: Container(
            //         height: 55,
            //         decoration: BoxDecoration(
            //           color: Colors.white,
            //           borderRadius: BorderRadius.circular(30),
            //           boxShadow: [
            //             BoxShadow(
            //               color: Colors.black.withOpacity(0.05),
            //               blurRadius: 10,
            //               offset: const Offset(0, 5),
            //             ),
            //           ],
            //         ),
            //         child: Row(
            //           children: [
            //             Padding(
            //               padding: const EdgeInsets.symmetric(horizontal: 15.0),
            //               child: Icon(Icons.search, color: Colors.grey[400], size: 24),
            //             ),
            //             Expanded(
            //               child: TextField(
            //                 decoration: InputDecoration(
            //                   hintText: "Search temples, beads, offerings...",
            //                   hintStyle: TextStyle(
            //                     color: Colors.grey[400],
            //                     fontSize: 15,
            //                     fontWeight: FontWeight.w500,
            //                   ),
            //                   border: InputBorder.none,
            //                 ),
            //               ),
            //             ),
            //           ],
            //         ),
            //       ),
            //     ),
            //   ),
            // ),

            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: Dimensions.paddingSizeDefault,
                  vertical: 10,
                ),
                child: Column(
                  children: [


                    // const SizedBox(height: 15),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          "Featured Items",
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Get.theme.primaryColor,
                          ),
                        ),
                        Icon(Icons.arrow_forward_rounded, color: Get.theme.primaryColor),
                      ],
                    ),
                    const SizedBox(height: 15),

                    SizedBox(
                      height: 400,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: name.length,
                        // padding: const EdgeInsets.symmetric(horizontal: 12),
                        itemBuilder: (context, index) {
                          return Padding(
                            padding: const EdgeInsets.only(right: 14),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(20),
                              onTap: () {
                                // open product detail if needed
                              },
                              child: Container(
                                width: 180,     clipBehavior: Clip.antiAlias,
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(20),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.06),
                                      blurRadius: 15,
                                      offset: const Offset(0, 5),
                                    ),
                                  ],
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    /// IMAGE SECTION
                                    Stack(
                                      children: [
                                        SizedBox(
                                          height: 220,
                                          width: double.infinity,
                                          child: Image.network(
                                            images[index],
                                            fit: BoxFit.cover,
                                            errorBuilder: (context, error, stackTrace) {
                                              return Container(
                                                color: Colors.grey[200],
                                                child: const Center(
                                                  child: Icon(
                                                    Icons.broken_image,
                                                    size: 50,
                                                    color: Colors.grey,
                                                  ),
                                                ),
                                              );
                                            },
                                          ),
                                        ),

                                        /// DISCOUNT BADGE
                                        Positioned(
                                          top: 10,
                                          left: 10,
                                          child: Container(
                                            padding: const EdgeInsets.symmetric(
                                                horizontal: 8, vertical: 4),
                                            decoration: BoxDecoration(
                                              color: Colors.redAccent.withOpacity(0.9),
                                              borderRadius: BorderRadius.circular(8),
                                            ),
                                            child: const Text(
                                              "-35%",
                                              style: TextStyle(
                                                color: Colors.white,
                                                fontSize: 10,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ),
                                        ),

                                        /// FAVORITE ICON
                                        Positioned(
                                          top: 10,
                                          right: 10,
                                          child: Container(
                                            padding: const EdgeInsets.all(6),
                                            decoration: BoxDecoration(
                                              shape: BoxShape.circle,
                                              color: Colors.white.withOpacity(0.9),
                                            ),
                                            child: Icon(
                                              Icons.favorite_border,
                                              size: 20,
                                              color: Get.theme.primaryColor,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),

                                    /// CONTENT SECTION
                                    Expanded(
                                      child: Padding(
                                        padding: const EdgeInsets.all(12),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              "Prayer Beads",
                                              style: TextStyle(
                                                fontSize: 13,
                                                color: Get.theme.primaryColor,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              name[index],
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                              style: const TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              "Authentic Rudraksha mala for meditation & peace.",
                                              maxLines: 2,
                                              overflow: TextOverflow.ellipsis,
                                              style: TextStyle(
                                                fontSize: 13,
                                                color: Colors.grey[600],
                                              ),
                                            ),

                                            const Spacer(),

                                            /// RATING
                                            Row(
                                              children: [
                                                const Icon(Icons.star,
                                                    color: Colors.orange, size: 16),
                                                const SizedBox(width: 4),
                                                const Text("4.9",
                                                    style: TextStyle(
                                                        fontWeight: FontWeight.w600)),
                                                Text(
                                                  " (12,500)",
                                                  style: TextStyle(
                                                    fontSize: 12,
                                                    color: Colors.grey[600],
                                                  ),
                                                ),
                                              ],
                                            ),

                                            const SizedBox(height: 10),

                                            /// PRICE + ADD BUTTON
                                            Row(
                                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                              children: [
                                                Row(
                                                  children: const [
                                                    Text(
                                                      "₹1299",
                                                      style: TextStyle(
                                                        fontSize: 15,
                                                        fontWeight: FontWeight.bold,
                                                      ),
                                                    ),
                                                    SizedBox(width: 6),
                                                    Text(
                                                      "₹1999",
                                                      style: TextStyle(
                                                        fontSize: 11,
                                                        color: Colors.grey,
                                                        decoration:
                                                        TextDecoration.lineThrough,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                                InkWell(
                                                  onTap: () {
                                                    Get.to(() => CartScreen());
                                                  },
                                                  borderRadius: BorderRadius.circular(8),
                                                  child: Container(
                                                    padding: const EdgeInsets.symmetric(
                                                        horizontal: 12, vertical: 6),
                                                    decoration: BoxDecoration(
                                                      color: Get.theme.primaryColor,
                                                      borderRadius: BorderRadius.circular(8),
                                                      boxShadow: [
                                                        BoxShadow(
                                                          color: Get.theme.primaryColor
                                                              .withOpacity(0.4),
                                                          blurRadius: 8,
                                                          offset: const Offset(0, 4),
                                                        ),
                                                      ],
                                                    ),
                                                    child: const Text(
                                                      "Add",
                                                      style: TextStyle(
                                                        color: Colors.white,
                                                        fontSize: 13,
                                                        fontWeight: FontWeight.w600,
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    )  , const SizedBox(height: 30),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          "Wished Items",
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Get.theme.primaryColor,
                          ),
                        ),
                        Icon(Icons.arrow_forward_rounded, color: Get.theme.primaryColor),
                      ],
                    ),
                    const SizedBox(height: 15),

                    SizedBox(
                      height: 400,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: name.length,
                        // padding: const EdgeInsets.symmetric(horizontal: 12),
                        itemBuilder: (context, index) {
                          return Padding(
                            padding: const EdgeInsets.only(right: 14),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(20),
                              onTap: () {
                                // open product detail if needed
                              },
                              child: Container(
                                width: 180,     clipBehavior: Clip.antiAlias,
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(20),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.06),
                                      blurRadius: 15,
                                      offset: const Offset(0, 5),
                                    ),
                                  ],
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    /// IMAGE SECTION
                                    Stack(
                                      children: [
                                        SizedBox(
                                          height: 220,
                                          width: double.infinity,
                                          child: Image.network(
                                            images[index],
                                            fit: BoxFit.cover,
                                            errorBuilder: (context, error, stackTrace) {
                                              return Container(
                                                color: Colors.grey[200],
                                                child: const Center(
                                                  child: Icon(
                                                    Icons.broken_image,
                                                    size: 50,
                                                    color: Colors.grey,
                                                  ),
                                                ),
                                              );
                                            },
                                          ),
                                        ),

                                        /// DISCOUNT BADGE
                                        Positioned(
                                          top: 10,
                                          left: 10,
                                          child: Container(
                                            padding: const EdgeInsets.symmetric(
                                                horizontal: 8, vertical: 4),
                                            decoration: BoxDecoration(
                                              color: Colors.redAccent.withOpacity(0.9),
                                              borderRadius: BorderRadius.circular(8),
                                            ),
                                            child: const Text(
                                              "-35%",
                                              style: TextStyle(
                                                color: Colors.white,
                                                fontSize: 10,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ),
                                        ),

                                        /// FAVORITE ICON
                                        Positioned(
                                          top: 10,
                                          right: 10,
                                          child: Container(
                                            padding: const EdgeInsets.all(6),
                                            decoration: BoxDecoration(
                                              shape: BoxShape.circle,
                                              color: Colors.white.withOpacity(0.9),
                                            ),
                                            child: Icon(
                                              Icons.favorite,
                                              size: 20,
                                              color: Get.theme.primaryColor,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),

                                    /// CONTENT SECTION
                                    Expanded(
                                      child: Padding(
                                        padding: const EdgeInsets.all(12),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              "Prayer Beads",
                                              style: TextStyle(
                                                fontSize: 13,
                                                color: Get.theme.primaryColor,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              name[index],
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                              style: const TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              "Authentic Rudraksha mala for meditation & peace.",
                                              maxLines: 2,
                                              overflow: TextOverflow.ellipsis,
                                              style: TextStyle(
                                                fontSize: 13,
                                                color: Colors.grey[600],
                                              ),
                                            ),

                                            const Spacer(),

                                            /// RATING
                                            Row(
                                              children: [
                                                const Icon(Icons.star,
                                                    color: Colors.orange, size: 16),
                                                const SizedBox(width: 4),
                                                const Text("4.9",
                                                    style: TextStyle(
                                                        fontWeight: FontWeight.w600)),
                                                Text(
                                                  " (12,500)",
                                                  style: TextStyle(
                                                    fontSize: 12,
                                                    color: Colors.grey[600],
                                                  ),
                                                ),
                                              ],
                                            ),

                                            const SizedBox(height: 10),

                                            /// PRICE + ADD BUTTON
                                            Row(
                                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                              children: [
                                                Row(
                                                  children: const [
                                                    Text(
                                                      "₹1299",
                                                      style: TextStyle(
                                                        fontSize: 15,
                                                        fontWeight: FontWeight.bold,
                                                      ),
                                                    ),
                                                    SizedBox(width: 6),
                                                    Text(
                                                      "₹1999",
                                                      style: TextStyle(
                                                        fontSize: 11,
                                                        color: Colors.grey,
                                                        decoration:
                                                        TextDecoration.lineThrough,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                                InkWell(
                                                  onTap: () {
                                                    Get.to(() => CartScreen());
                                                  },
                                                  borderRadius: BorderRadius.circular(8),
                                                  child: Container(
                                                    padding: const EdgeInsets.symmetric(
                                                        horizontal: 12, vertical: 6),
                                                    decoration: BoxDecoration(
                                                      color: Get.theme.primaryColor,
                                                      borderRadius: BorderRadius.circular(8),
                                                      boxShadow: [
                                                        BoxShadow(
                                                          color: Get.theme.primaryColor
                                                              .withOpacity(0.4),
                                                          blurRadius: 8,
                                                          offset: const Offset(0, 4),
                                                        ),
                                                      ],
                                                    ),
                                                    child: const Text(
                                                      "Add",
                                                      style: TextStyle(
                                                        color: Colors.white,
                                                        fontSize: 13,
                                                        fontWeight: FontWeight.w600,
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    )

                    ,
                    const SizedBox(height: 30),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          "More Items",
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Get.theme.primaryColor,
                          ),
                        ),
                        Icon(Icons.arrow_forward_rounded, color: Get.theme.primaryColor),
                      ],
                    ),
                    const SizedBox(height: 15),



                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: name.length,
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: itemWidth / itemHeight,
                        crossAxisSpacing: 15,
                        mainAxisSpacing: 20,
                      ),
                      itemBuilder: (context, index) {
                        return InkWell(
                          onTap: () {
                            // Get.to(() => TempleDetail(image: images[index], name: name[index]));
                          },
                          borderRadius: BorderRadius.circular(20),
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.06),
                                  blurRadius: 15,
                                  offset: const Offset(0, 5),
                                ),
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Stack(
                                  children: [

                                    ClipRRect(
                                      borderRadius: const BorderRadius.only(
                                        topLeft: Radius.circular(20),
                                        topRight: Radius.circular(20),
                                      ),
                                      child: SizedBox(
                                        width: double.infinity,
                                        child: Image.network(
                                          images[index],
                                          height: 220,
                                          fit: BoxFit.cover,
                                          errorBuilder: (context, error, stackTrace) {
                                            return Container(
                                              height: 160,
                                              color: Colors.grey[200],
                                              child: const Icon(Icons.broken_image,
                                                  size: 50, color: Colors.grey),
                                            );
                                          },
                                        ),
                                      ),
                                    ),
                                    Positioned(
                                      top: 10,
                                      left: 10,
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 8, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: Colors.redAccent.withOpacity(0.9),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: const Text(
                                          "-35%",
                                          style: TextStyle(
                                            color: Colors.white,
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                    ),
                                    Positioned(
                                      top: 10,
                                      right: 10,
                                      child:Container(
                                        padding: EdgeInsets.all(5),
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          color: Colors.white.withOpacity(0.8),
                                        ),
                                        child: Center(
                                          child: Icon(
                                            Icons.favorite_border,
                                            color: Get.theme.primaryColor,size: 20,
                                          ),
                                        ),
                                      ),
                                    ),


                                  ],
                                ),
                                Padding(
                                  padding: const EdgeInsets.all(12.0),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        "Prayer Beads",
                                        style: TextStyle(
                                          fontSize: 14,
                                          color: Get.theme.primaryColor,
                                          fontWeight: FontWeight.w600,
                                          letterSpacing: 0.5,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        name[index],
                                        style: const TextStyle(
                                          color: Colors.black87,
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                          height: 1.2,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        "Authentic Rudraksha mala for meditation & peace.",
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                          fontSize: 13,
                                          color: Colors.grey[600],
                                          height: 1.3,
                                        ),
                                      ),
                                      const SizedBox(height: 10),
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

                                      const SizedBox(height: 10),
                                      Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        crossAxisAlignment: CrossAxisAlignment.center,
                                        children: [
                                          Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Row(
                                                children: const [
                                                  Text(
                                                    "₹1299",
                                                    style: TextStyle(
                                                      fontSize: 15,
                                                      fontWeight: FontWeight.bold,
                                                      color: Colors.black87,
                                                    ),
                                                  ),
                                                  SizedBox(width: 6),
                                                  Text(
                                                    "₹1999",
                                                    style: TextStyle(
                                                      fontSize: 11,
                                                      color: Colors.grey,
                                                      decoration:
                                                          TextDecoration.lineThrough,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ],
                                          ),
                                          InkWell(
                                            onTap: () {
                                              Get.to(() => CartScreen());
                                            },
                                            borderRadius: BorderRadius.circular(8),
                                            child: Container(
                                              padding: const EdgeInsets.all(6),
                                              decoration: BoxDecoration(
                                                color: Get.theme.primaryColor,
                                                borderRadius: BorderRadius.circular(8),
                                                boxShadow: [
                                                  BoxShadow(
                                                    color: Get.theme.primaryColor
                                                        .withOpacity(0.4),
                                                    blurRadius: 8,
                                                    offset: const Offset(0, 4),
                                                  ),
                                                ],
                                              ),
                                              child: const Text("Add",
                                                  style:
                                                      TextStyle(color: Colors.white)),
                                            ),
                                          ),
                                        ],
                                      ),
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
            ),
          ],
        ),
      ),
    );
  }
}

class SearchHeaderDelegate extends SliverPersistentHeaderDelegate {
  final Widget child;

  SearchHeaderDelegate({required this.child});

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    return Container(
      color: const Color(0xFFF9F9F9),
      alignment: Alignment.center,
      child: child,
    );
  }

  @override
  double get maxExtent => 80.0;

  @override
  double get minExtent => 80.0;

  @override
  bool shouldRebuild(covariant SearchHeaderDelegate oldDelegate) {
    return false;
  }
}
