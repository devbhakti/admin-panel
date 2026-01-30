import 'package:devbhakti/controller/authcontroller.dart';
import 'package:devbhakti/util/app_constants.dart';
import 'package:devbhakti/util/dimensions.dart';
import 'package:devbhakti/views/dashboard/dashboard.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../util/images.dart';
import '../cart/cart.dart';
import '../home/temple_detail.dart';

class TempleScreen extends StatefulWidget {
  const TempleScreen({super.key});

  @override
  State<TempleScreen> createState() => _TempleScreenState();
}

class _TempleScreenState extends State<TempleScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  // Using final lists for better performance
  final List<String> images = [
    "https://devbhakti.koubcafe.in/_next/static/media/temple-kashi.36ab7a78.jpg",
    "https://devbhakti.koubcafe.in/_next/static/media/temple-tirupati.26682397.jpg",
    "https://devbhakti.koubcafe.in/_next/static/media/temple-siddhivinayak.98d2674b.jpg",
    "https://devbhakti.koubcafe.in/_next/static/media/temple-meenakshi.61ecd540.jpg",
  ];

  final List<String> name = [
    "Kashi Vishwanath Temple",
    "Tirupati Balaji Temple",
    "Siddhivinayak Temple",
    "Meenakshi Amman Temple",
  ];
  final List<String> knows = [
    "Moksha",
    "wealth",
    "success",
    "harmonious relationships",
  ];

  final List<String> nameGod = ["Vishnu", "Shakti", "Ganesh", "Shiv"];

  final List<String> locations = [
    "Varanasi, UP",
    "Tirupati, AP",
    "Mumbai, MH",
    "Madurai, TN",
  ];

  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Get.find<AuthController>().favouritesTemple();
      Get.find<AuthController>().temples();
    });
    // TODO: implement initState
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    // Get screen width to determine column count
    final screenWidth = MediaQuery.of(context).size.width;

    // Responsive CrossAxisCount logic
    int crossAxisCount = 2;
    if (screenWidth > 600) {
      // Tablet size starts roughly here
      crossAxisCount = 3;
    }
    if (screenWidth > 900) {
      // Desktop size
      crossAxisCount = 4;
    }

    return Scaffold(
      key: _scaffoldKey,

      // 2. Define the End Drawer
      // endDrawer: ModernDrawer(),
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        backgroundColor: Color(0xFFF9F9F9),
        automaticallyImplyLeading: false,
        centerTitle: false,

        // leadingWidth: 50,
        //
        // leading: InkWell(onTap: (){}, child: Icon(Icons.arrow_back_outlined)),
        title: Row(
          children: [
            //
            InkWell(
              onTap: () {
                Get.offAll(() => Dashboard(index: 2));
              },
              child: Icon(Icons.arrow_back_outlined),
            ),
            // SizedBox(width: 5,),
            // Image.asset(Images.logo2, height: 35),
            SizedBox(width: 15),
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
                    SizedBox(width: 5),
                    Image.asset(Images.logo2, height: 35),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        "Search Temples, Poojas & more…",
                        style: TextStyle(fontSize: 12),
                      ),
                    ),
                    Image.asset(Images.search, height: 26),
                    SizedBox(width: 5),
                  ],
                ),
              ),
            ),
            SizedBox(width: 10),

            Icon(Icons.notifications_none),
            SizedBox(width: 5),

            InkWell(
              onTap: () => Get.to(() => CartScreen()),
              child: const Icon(Icons.shopping_cart_outlined),
            ),
            SizedBox(width: 5),

            InkWell(
              onTap: () => _scaffoldKey.currentState?.openEndDrawer(),
              child: Image.asset(Images.options, height: 20),
            ),
          ],
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

      body: GetBuilder<AuthController>(
        builder: (authController) {
          return RefreshIndicator(
            onRefresh: () async {
              await authController.favouritesTemple();
              await authController.temples();
            },
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: EdgeInsets.all(Dimensions.paddingSizeDefault),
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "Featured Temples",
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Get.theme.primaryColor,
                      ),
                    ),
                    Icon(
                      Icons.arrow_forward_rounded,
                      color: Get.theme.primaryColor,
                    ),
                  ],
                ),

                SizedBox(height: 10),

                SizedBox(
                  height: 300,
                  width: Get.width,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: authController.getTemplesList.length,
                    // padding: const EdgeInsets.symmetric(horizontal: 12),
                    itemBuilder: (context, index) {
                      var temple = authController.getTemplesList[index];
                      return Padding(
                        padding: const EdgeInsets.only(right: 12),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(
                            Dimensions.radiusDefault,
                          ),
                          onTap: () {
                            Get.to(
                              () => TempleDetail(
                                id: authController.getTemplesList[index].id
                                    .toString(),
                                image:
                                    AppConstants.baseUrl +
                                    temple.image.toString(),
                                name: temple.name.toString(),
                              ),
                            );
                          },
                          child: Stack(
                            children: [
                              Container(
                                width: 180,
                                clipBehavior: Clip.antiAlias,
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(
                                    Dimensions.radiusDefault,
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.08),
                                      blurRadius: 8,
                                      spreadRadius: 1,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    /// Image Section
                                    SizedBox(
                                      height: 160,
                                      width: double.infinity,
                                      child: Image.network(
                                        AppConstants.baseUrl +
                                            temple.image.toString(),
                                        fit: BoxFit.cover,
                                        errorBuilder:
                                            (context, error, stackTrace) {
                                              return Container(
                                                color: Colors.grey[300],
                                                child: const Center(
                                                  child: Icon(
                                                    Icons.broken_image,
                                                  ),
                                                ),
                                              );
                                            },
                                      ),
                                    ),

                                    /// Content Section
                                    Expanded(
                                      child: Padding(
                                        padding: const EdgeInsets.all(10),
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          children: [
                                            Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  temple.name.toString(),
                                                  maxLines: 1,
                                                  overflow:
                                                      TextOverflow.ellipsis,
                                                  style: const TextStyle(
                                                    fontSize: 15,
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                ),
                                                const SizedBox(height: 4),
                                                Text(
                                                  "Temple is Known For ${temple.description ?? (knows.length > index ? knows[index] : 'Moksha')}",
                                                  maxLines: 2,
                                                  overflow:
                                                      TextOverflow.ellipsis,
                                                  style: TextStyle(
                                                    fontSize: 12,
                                                    color: Colors.black,
                                                  ),
                                                ),
                                              ],
                                            ),
                                            const SizedBox(height: 4),

                                            Row(
                                              children: [
                                                const Icon(
                                                  Icons.location_on_outlined,
                                                  color: Colors.redAccent,
                                                  size: 16,
                                                ),
                                                const SizedBox(width: 4),
                                                Expanded(
                                                  child: Text(
                                                    temple.location ?? "India",
                                                    style: TextStyle(
                                                      color: Colors.black,
                                                      fontSize: 12,
                                                    ),
                                                    maxLines: 1,
                                                    overflow:
                                                        TextOverflow.ellipsis,
                                                  ),
                                                ),
                                              ],
                                            ),

                                            /// Rating
                                            Row(
                                              children: [
                                                const Icon(
                                                  Icons.star,
                                                  color: Colors.orange,
                                                  size: 16,
                                                ),
                                                const SizedBox(width: 4),
                                                const Text(
                                                  "4.9",
                                                  style: TextStyle(
                                                    fontSize: 13,
                                                    fontWeight: FontWeight.w600,
                                                  ),
                                                ),
                                                Text(
                                                  " (12.5k)",
                                                  style: TextStyle(
                                                    fontSize: 11,
                                                    color: Colors.grey[600],
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

                              Positioned(
                                top: 10,
                                right: 10,
                                child: InkWell(
                                  onTap: () {
                                    authController
                                                .getTemplesList[index]
                                                .isFavorite ==
                                            true
                                        ? Get.find<AuthController>()
                                              .removeFavourite(
                                                id: authController
                                                    .getTemplesList[index]
                                                    .id!,
                                              )
                                              .then((_) {
                                                authController
                                                    .favouritesTemple();
                                                authController.temples();
                                              })
                                        : Get.find<AuthController>()
                                              .addFavourite(
                                                id: authController
                                                    .getTemplesList[index]
                                                    .id!,
                                              )
                                              .then((_) {
                                                authController
                                                    .favouritesTemple();
                                                authController.temples();
                                              });
                                  },

                                  child: Container(
                                    padding: EdgeInsets.all(5),
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: Colors.white.withOpacity(0.5),
                                    ),
                                    child: Center(
                                      child: Icon(
                                        authController
                                                    .getTemplesList[index]
                                                    .isFavorite ==
                                                false
                                            ? Icons.favorite_border
                                            : Icons.favorite,
                                        color: Get.theme.primaryColor,
                                        size: 15,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),

                authController.getFavouriteTemplesList.isEmpty
                    ? SizedBox()
                    : SizedBox(height: 30),

                authController.getFavouriteTemplesList.isEmpty
                    ? SizedBox()
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            "Favourite Temples",
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: Get.theme.primaryColor,
                            ),
                          ),
                          Icon(
                            Icons.arrow_forward_rounded,
                            color: Get.theme.primaryColor,
                          ),
                        ],
                      ),

                authController.getFavouriteTemplesList.isEmpty
                    ? SizedBox()
                    : SizedBox(height: 10),

                authController.getFavouriteTemplesList.isEmpty
                    ? SizedBox()
                    : SizedBox(
                        height: 300,
                        width: Get.width,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount:
                              authController.getFavouriteTemplesList.length,
                          // padding: const EdgeInsets.symmetric(horizontal: 12),
                          itemBuilder: (context, index) {
                            return Padding(
                              padding: const EdgeInsets.only(right: 12),
                              child: InkWell(
                                borderRadius: BorderRadius.circular(
                                  Dimensions.radiusDefault,
                                ),
                                onTap: () {
                                  var favTemple = authController
                                      .getFavouriteTemplesList[index]
                                      .temple!;
                                  Get.to(
                                    () => TempleDetail(
                                      id: authController
                                          .getTemplesList[index]
                                          .id
                                          .toString(),
                                      image:
                                          AppConstants.baseUrl +
                                          favTemple.image.toString(),
                                      name: favTemple.name.toString(),
                                    ),
                                  );
                                },
                                child: Stack(
                                  children: [
                                    Container(
                                      width:
                                          180, // 🔴 IMPORTANT for horizontal list
                                      clipBehavior: Clip.antiAlias,
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(
                                          Dimensions.radiusDefault,
                                        ),
                                        boxShadow: [
                                          BoxShadow(
                                            color: Colors.black.withOpacity(
                                              0.08,
                                            ),
                                            blurRadius: 8,
                                            spreadRadius: 1,
                                            offset: const Offset(0, 4),
                                          ),
                                        ],
                                      ),
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          /// Image Section
                                          SizedBox(
                                            height: 160,
                                            width: double.infinity,
                                            child: Image.network(
                                              AppConstants.baseUrl +
                                                  authController
                                                      .getFavouriteTemplesList[index]
                                                      .temple!
                                                      .image
                                                      .toString(),
                                              fit: BoxFit.cover,
                                              errorBuilder:
                                                  (context, error, stackTrace) {
                                                    return Container(
                                                      color: Colors.grey[300],
                                                      child: const Center(
                                                        child: Icon(
                                                          Icons.broken_image,
                                                        ),
                                                      ),
                                                    );
                                                  },
                                            ),
                                          ),

                                          /// Content Section
                                          Expanded(
                                            child: Padding(
                                              padding: const EdgeInsets.all(10),
                                              child: Column(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                mainAxisAlignment:
                                                    MainAxisAlignment
                                                        .spaceBetween,
                                                children: [
                                                  Column(
                                                    crossAxisAlignment:
                                                        CrossAxisAlignment
                                                            .start,
                                                    children: [
                                                      Text(
                                                        authController
                                                            .getFavouriteTemplesList[index]
                                                            .temple!
                                                            .name
                                                            .toString(),

                                                        maxLines: 1,
                                                        overflow: TextOverflow
                                                            .ellipsis,
                                                        style: const TextStyle(
                                                          fontSize: 15,
                                                          fontWeight:
                                                              FontWeight.bold,
                                                        ),
                                                      ),
                                                      const SizedBox(height: 4),
                                                      Text(
                                                        "Temple is Known For ${authController.getFavouriteTemplesList[index].temple!.description ?? (knows.length > index ? knows[index] : 'Moksha')}",
                                                        maxLines: 2,
                                                        overflow: TextOverflow
                                                            .ellipsis,
                                                        style: TextStyle(
                                                          fontSize: 12,
                                                          color: Colors.black,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                  const SizedBox(height: 4),

                                                  Row(
                                                    children: [
                                                      const Icon(
                                                        Icons
                                                            .location_on_outlined,
                                                        color: Colors.redAccent,
                                                        size: 16,
                                                      ),
                                                      const SizedBox(width: 4),
                                                      Expanded(
                                                        child: Text(
                                                          authController
                                                              .getFavouriteTemplesList[index]
                                                              .temple!
                                                              .location
                                                              .toString(),
                                                          style: TextStyle(
                                                            color: Colors.black,

                                                            fontSize: 12,
                                                          ),
                                                          maxLines: 1,
                                                          overflow: TextOverflow
                                                              .ellipsis,
                                                        ),
                                                      ),
                                                    ],
                                                  ),

                                                  /// Rating
                                                  Row(
                                                    children: [
                                                      const Icon(
                                                        Icons.star,
                                                        color: Colors.orange,
                                                        size: 16,
                                                      ),
                                                      const SizedBox(width: 4),
                                                      const Text(
                                                        "4.9",
                                                        style: TextStyle(
                                                          fontSize: 13,
                                                          fontWeight:
                                                              FontWeight.w600,
                                                        ),
                                                      ),
                                                      Text(
                                                        " (12.5k)",
                                                        style: TextStyle(
                                                          fontSize: 11,
                                                          color:
                                                              Colors.grey[600],
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
                                    Positioned(
                                      top: 10,
                                      right: 10,
                                      child: InkWell(
                                        onTap: () {
                                          Get.find<AuthController>()
                                              .removeFavourite(
                                                id: authController
                                                    .getFavouriteTemplesList[index]
                                                    .templeId!,
                                              )
                                              .then((_) {
                                                authController
                                                    .favouritesTemple();
                                                authController.temples();
                                              });
                                        },

                                        child: Container(
                                          padding: EdgeInsets.all(5),
                                          decoration: BoxDecoration(
                                            shape: BoxShape.circle,
                                            color: Colors.white.withOpacity(
                                              0.5,
                                            ),
                                          ),
                                          child: Center(
                                            child: Icon(
                                              Icons.favorite,
                                              color: Get.theme.primaryColor,
                                              size: 15,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ),

                SizedBox(height: 20),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "More Temples",
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Get.theme.primaryColor,
                      ),
                    ),
                    Icon(
                      Icons.arrow_forward_rounded,
                      color: Get.theme.primaryColor,
                    ),
                  ],
                ),

                SizedBox(height: 10),

                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  // Better scrolling physics
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: crossAxisCount,
                    childAspectRatio: screenWidth < 600 ? 0.62 : 0.65,
                    crossAxisSpacing: 15,
                    mainAxisSpacing: 15,
                  ),
                  itemCount: authController.getTemplesList.length,
                  itemBuilder: (context, index) {
                    return InkWell(
                      onTap: () {
                        Get.to(
                          () => TempleDetail(
                            id: authController.getTemplesList[index].id
                                .toString(),
                            image:
                                AppConstants.baseUrl +
                                authController.getTemplesList[index].image
                                    .toString(),
                            name: authController.getTemplesList[index].name
                                .toString(),
                          ),
                        );
                      },
                      child: _buildTempleCard(
                        authController.getTemplesList[index],
                        index,
                      ),
                    );
                  },
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildTempleCard(temple, int index) {
    return Stack(
      children: [
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(Dimensions.radiusDefault),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.08), // Softer shadow
                blurRadius: 8,
                spreadRadius: 1,
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Image Section
              SizedBox(
                width: double.infinity,
                child: LayoutBuilder(
                  builder: (context, constraints) {
                    return SizedBox(
                      height:
                          constraints.maxWidth * 0.8, // Maintains aspect ratio
                      child: Stack(
                        children: [
                          ClipRRect(
                            borderRadius: const BorderRadius.only(
                              topLeft: Radius.circular(
                                Dimensions.radiusDefault,
                              ),
                              topRight: Radius.circular(
                                Dimensions.radiusDefault,
                              ),
                            ),
                            child: Image.network(
                              AppConstants.baseUrl + temple.image.toString(),
                              fit: BoxFit.cover,
                              width: double.infinity,
                              errorBuilder: (context, error, stackTrace) {
                                return Container(
                                  color: Colors.black,

                                  child: const Center(
                                    child: Icon(Icons.broken_image),
                                  ),
                                );
                              },
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),

              // Content Section
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(10.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Title and Location
                      Text(
                        temple.name.toString(),
                        style: const TextStyle(
                          color: Colors.black87,
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        "Temple is Known For ${temple.description ?? (knows.length > index ? knows[index] : 'Moksha')}",
                        style: const TextStyle(
                          color: Colors.black,
                          fontSize: 12,
                          // fontWeight: FontWeight.bold,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),

                      Row(
                        children: [
                          const Icon(
                            Icons.location_on_outlined,
                            color: Colors.redAccent,
                            size: 16,
                          ),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              temple.location ?? "India",
                              style: TextStyle(
                                color: Colors.black,

                                fontSize: 12,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),

                      // Stats (Rating and Time)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(
                                Icons.star,
                                color: Colors.orange,
                                size: 16,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                "4.9",
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              Text(
                                " (12.5k)",
                                style: TextStyle(
                                  color: Colors.grey[600],
                                  fontSize: 11,
                                ),
                              ),
                            ],
                          ),
                          // Container(
                          //   padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          //   decoration: BoxDecoration(
                          //     color: Colors.green[50],
                          //     borderRadius: BorderRadius.circular(4),
                          //   ),
                          //   child: Row(
                          //     children: [
                          //       Icon(Icons.watch_later_outlined, color: Colors.green[700], size: 12),
                          //       const SizedBox(width: 2),
                          //       Text(
                          //         "04:00 AM",
                          //         style: TextStyle(color: Colors.green[700], fontSize: 11),
                          //       ),
                          //     ],
                          //   ),
                          // ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        Positioned(
          top: 10,
          right: 10,
          child: Container(
            padding: EdgeInsets.all(5),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white.withOpacity(0.5),
            ),
            child: Center(
              child: InkWell(
                onTap: () {
                  if (temple.isFavorite == true) {
                    Get.find<AuthController>()
                        .removeFavourite(id: temple.id!)
                        .then((_) {
                          Get.find<AuthController>().favouritesTemple();
                          Get.find<AuthController>().temples();
                        });
                  } else {
                    Get.find<AuthController>()
                        .addFavourite(id: temple.id!)
                        .then((_) {
                          Get.find<AuthController>().favouritesTemple();
                          Get.find<AuthController>().temples();
                        });
                  }
                },
                child: Icon(
                  temple.isFavorite == true
                      ? Icons.favorite
                      : Icons.favorite_border,
                  color: Get.theme.primaryColor,
                  size: 15,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
