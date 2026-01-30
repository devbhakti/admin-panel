import 'package:devbhakti/controller/authcontroller.dart';
import 'package:devbhakti/util/app_constants.dart';
import 'package:devbhakti/util/dimensions.dart';
import 'package:devbhakti/util/images.dart';
import 'package:devbhakti/views/bookings/create_booking.dart';
import 'package:devbhakti/views/donation/donation_purpose.dart';
import 'package:devbhakti/views/home/aarti_detail_screen.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get/get_connect/http/src/utils/utils.dart';
import 'home_shimmer.dart';

class TempleDetail extends StatefulWidget {
  final String image;
  final String name;
  final String id;

  const TempleDetail({
    super.key,
    required this.image,
    required this.name,
    required this.id,
  });

  @override
  State<TempleDetail> createState() => _TempleDetailState();
}

class _TempleDetailState extends State<TempleDetail> {
  int selectedIndex = 0;

  List images = [
    "https://devbhakti.koubcafe.in/_next/static/media/temple-kashi.36ab7a78.jpg",
    "https://devbhakti.koubcafe.in/_next/static/media/temple-tirupati.26682397.jpg",
    "https://devbhakti.koubcafe.in/_next/static/media/temple-siddhivinayak.98d2674b.jpg",
    "https://kashiyatra.in/wp-content/uploads/2024/04/shri-kashi-vishwanath.jpg",
  ];
  List name = [
    "Kashi Vishwanath Temple",
    "Tirupati Balaji Temple",
    "Siddhivinayak Temple",
    "Meenakshi Amman Temple",
  ];

  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Get.find<AuthController>().templeDetails(id: widget.id);
    });
    // TODO: implement initState
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // CustomScrollView allows mixing a SliverAppBar with sliver content
      body: GetBuilder<AuthController>(
        builder: (authController) {
          return CustomScrollView(
            slivers: [
              SliverAppBar(
                expandedHeight: 300, // Height of the image when fully expanded
                pinned:
                    true, // Keeps the bar visible at the top after scrolling
                floating: false,
                backgroundColor: Get.theme.primaryColor,
                elevation: 0, // Flat look initially
                actions: [
                  Container(
                    padding: EdgeInsets.all(5),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white.withOpacity(0.5),
                    ),
                    child: Center(
                      child: Icon(
                        Icons.favorite_border,
                        color: Get.theme.primaryColor,
                        size: 20,
                      ),
                    ),
                  ),
                  SizedBox(width: 10),
                ],
                flexibleSpace: FlexibleSpaceBar(
                  title: Text(
                    widget.name,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      shadows: [
                        Shadow(
                          blurRadius: 10.0,
                          color: Colors.black45,
                          offset: Offset(2, 2),
                        ),
                      ],
                    ),
                  ),

                  background: Stack(
                    fit: StackFit.expand,
                    children: [
                      // The Image
                      Image.network(
                        widget.image,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          // Fallback if image fails to load
                          return Container(color: Colors.grey[300]);
                        },
                      ),
                      // Gradient Overlay for better text readability
                      const DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.black26,
                              Colors.transparent,
                              Colors.black54,
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              SliverPadding(
                padding: const EdgeInsets.all(20.0),
                sliver: SliverToBoxAdapter(
                  child: authController.templeDetailsModel == null
                      ? const TempleDetailShimmer()
                      : Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: InkWell(
                                    onTap: () {
                                      Get.to(() => CreateBookingScreen());
                                    },
                                    child: Container(
                                      height: 30,
                                      decoration: BoxDecoration(
                                        color: Get.theme.primaryColor,
                                        border: Border.all(
                                          color: Get.theme.primaryColor,
                                        ),
                                        borderRadius:
                                            BorderRadiusGeometry.circular(
                                              Dimensions.radiusSmall,
                                            ),
                                      ),
                                      child: Center(
                                        child: Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          children: [
                                            Text(
                                              "Book Pooja & Seva",
                                              style: TextStyle(
                                                color: Colors.white,
                                                fontSize: 12,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                                SizedBox(width: 10),
                                Expanded(
                                  child: InkWell(
                                    onTap: () {
                                      Get.to(() => CreateBookingScreen());
                                    },
                                    child: Container(
                                      height: 30,
                                      decoration: BoxDecoration(
                                        color: Get.theme.primaryColor,
                                        border: Border.all(
                                          color: Get.theme.primaryColor,
                                        ),
                                        borderRadius:
                                            BorderRadiusGeometry.circular(
                                              Dimensions.radiusSmall,
                                            ),
                                      ),
                                      child: Center(
                                        child: Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          children: [
                                            Text(
                                              "Live Darshan",
                                              style: TextStyle(
                                                color: Colors.white,
                                                fontSize: 12,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                                SizedBox(width: 10),
                                Expanded(
                                  child: InkWell(
                                    onTap: () {
                                      Get.to(() => CreateBookingScreen());
                                    },
                                    child: Container(
                                      height: 30,
                                      decoration: BoxDecoration(
                                        color: Get.theme.primaryColor,
                                        border: Border.all(
                                          color: Get.theme.primaryColor,
                                        ),
                                        borderRadius:
                                            BorderRadiusGeometry.circular(
                                              Dimensions.radiusSmall,
                                            ),
                                      ),
                                      child: Center(
                                        child: Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          children: [
                                            Text(
                                              "Scared Items",
                                              style: TextStyle(
                                                color: Colors.white,
                                                fontSize: 12,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            SizedBox(height: 20),
                            Text(
                              widget.name,
                              style: const TextStyle(
                                fontSize: 28,
                                fontWeight: FontWeight.bold,
                                color: Colors.black87,
                              ),
                            ),
                            const SizedBox(height: 16),
                            Row(
                              children: [
                                Icon(Icons.location_on_outlined, size: 18),
                                Text(
                                  authController.templeDetailsModel!.location
                                      .toString(),
                                ),
                              ],
                            ),
                            Row(
                              children: [
                                Icon(Icons.history, size: 18),
                                SizedBox(width: 5),
                                Text(
                                  authController.templeDetailsModel!.openTime
                                      .toString(),
                                ),
                              ],
                            ),
                            SizedBox(height: 10),
                            SizedBox(
                              height: 50,
                              child: ListView.builder(
                                scrollDirection: Axis.horizontal,
                                itemCount: 4,
                                itemBuilder: (context, index) {
                                  final titles = [
                                    "Poojas & Sevas",
                                    "About",
                                    "Events",
                                    "Gallery",
                                  ];

                                  final isSelected = selectedIndex == index;

                                  return Padding(
                                    padding: const EdgeInsets.only(right: 8),
                                    child: GestureDetector(
                                      onTap: () {
                                        setState(() {
                                          selectedIndex = index;
                                        });
                                      },
                                      child: Row(
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 14,
                                              vertical: 8,
                                            ),
                                            decoration: BoxDecoration(
                                              color: isSelected
                                                  ? Get.theme.primaryColor
                                                  : Colors.transparent,
                                              border: Border.all(
                                                color: Get.theme.primaryColor,
                                              ),
                                              borderRadius:
                                                  BorderRadius.circular(
                                                    Dimensions.radiusSmall,
                                                  ),
                                            ),
                                            child: Text(
                                              titles[index],
                                              style: TextStyle(
                                                color: isSelected
                                                    ? Colors.white
                                                    : Get.theme.primaryColor,
                                                fontWeight: FontWeight.w500,
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
                            const SizedBox(height: 16),
                            selectedIndex == 1
                                ? Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        (authController
                                                        .templeDetailsModel!
                                                        .description ==
                                                    null ||
                                                authController
                                                    .templeDetailsModel!
                                                    .description!
                                                    .isEmpty)
                                            ? "No Data Found"
                                            : authController
                                                  .templeDetailsModel!
                                                  .description
                                                  .toString(),
                                        style: const TextStyle(
                                          fontSize: 16,
                                          height: 1.5,
                                          color: Colors.black54,
                                        ),
                                      ),
                                    ],
                                  )
                                : const SizedBox(height: 0),
                            selectedIndex == 0
                                ? (authController.templeDetailsModel!.poojas ==
                                              null ||
                                          authController
                                              .templeDetailsModel!
                                              .poojas!
                                              .isEmpty)
                                      ? const Center(
                                          child: Padding(
                                            padding: EdgeInsets.symmetric(
                                              vertical: 20,
                                            ),
                                            child: Text(
                                              "No Poojas Found",
                                              style: TextStyle(
                                                color: Colors.grey,
                                              ),
                                            ),
                                          ),
                                        )
                                      : ListView.builder(
                                          padding: EdgeInsets.zero,
                                          shrinkWrap: true,
                                          physics:
                                              const NeverScrollableScrollPhysics(),
                                          itemCount: authController
                                              .templeDetailsModel!
                                              .poojas!
                                              .length,
                                          itemBuilder: (context, index) {
                                            return InkWell(
                                              onTap: () {
                                                Get.to(
                                                  () =>
                                                      const AartiDetailScreen(),
                                                );
                                              },
                                              child: Container(
                                                margin: const EdgeInsets.only(
                                                  bottom: 10,
                                                ),
                                                decoration: BoxDecoration(
                                                  color: Colors.white,
                                                  borderRadius:
                                                      BorderRadius.circular(
                                                        Dimensions
                                                            .radiusDefault,
                                                      ),
                                                  boxShadow: [
                                                    BoxShadow(
                                                      color: Colors.black
                                                          .withOpacity(0.05),
                                                      blurRadius: 5,
                                                      offset: const Offset(
                                                        0,
                                                        2,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                                padding: const EdgeInsets.all(
                                                  Dimensions.paddingSizeSmall,
                                                ),
                                                child: Row(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.start,
                                                  mainAxisAlignment:
                                                      MainAxisAlignment
                                                          .spaceBetween,
                                                  children: [
                                                    Expanded(
                                                      child: Column(
                                                        crossAxisAlignment:
                                                            CrossAxisAlignment
                                                                .start,
                                                        children: [
                                                          Text(
                                                            authController
                                                                .templeDetailsModel!
                                                                .poojas![index]
                                                                .name
                                                                .toString(),
                                                            style:
                                                                const TextStyle(
                                                                  fontSize: 18,
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .bold,
                                                                  fontFamily:
                                                                      'Georgia',
                                                                ),
                                                          ),
                                                          const Text(
                                                            "For Ancestral Shanti, Prosperity, Kids, Love life",
                                                            maxLines: 2,
                                                            style: TextStyle(
                                                              fontSize: 12,
                                                              color:
                                                                  Colors.grey,
                                                            ),
                                                          ),
                                                        ],
                                                      ),
                                                    ),
                                                    const SizedBox(width: 10),
                                                    Column(
                                                      children: [
                                                        Text(
                                                          "From ₹${authController.templeDetailsModel!.poojas![index].price.toString()}",
                                                          style: TextStyle(
                                                            fontSize: 14,
                                                            fontWeight:
                                                                FontWeight.bold,
                                                            color: Get
                                                                .theme
                                                                .primaryColor,
                                                          ),
                                                        ),
                                                        const SizedBox(
                                                          height: 5,
                                                        ),
                                                        Container(
                                                          padding:
                                                              const EdgeInsets.symmetric(
                                                                horizontal: 10,
                                                                vertical: 5,
                                                              ),
                                                          decoration: BoxDecoration(
                                                            color: Get
                                                                .theme
                                                                .primaryColor,
                                                            borderRadius:
                                                                BorderRadius.circular(
                                                                  Dimensions
                                                                      .radiusSmall,
                                                                ),
                                                          ),
                                                          child: const Text(
                                                            "Book Now",
                                                            style: TextStyle(
                                                              fontSize: 11,
                                                              color:
                                                                  Colors.white,
                                                              fontWeight:
                                                                  FontWeight
                                                                      .bold,
                                                            ),
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            );
                                          },
                                        )
                                : const SizedBox(),
                            selectedIndex == 2
                                ? (authController.templeDetailsModel!.events ==
                                              null ||
                                          authController
                                              .templeDetailsModel!
                                              .events!
                                              .isEmpty)
                                      ? const Center(
                                          child: Padding(
                                            padding: EdgeInsets.symmetric(
                                              vertical: 20,
                                            ),
                                            child: Text(
                                              "No Events Found",
                                              style: TextStyle(
                                                color: Colors.grey,
                                              ),
                                            ),
                                          ),
                                        )
                                      : ListView.builder(
                                          physics:
                                              const NeverScrollableScrollPhysics(),
                                          padding: EdgeInsets.zero,
                                          shrinkWrap: true,
                                          itemCount: authController
                                              .templeDetailsModel!
                                              .events!
                                              .length,
                                          itemBuilder: (context, index) {
                                            return Container(
                                              margin: const EdgeInsets.only(
                                                bottom: 10,
                                              ),
                                              decoration: BoxDecoration(
                                                color: Colors.white,
                                                borderRadius:
                                                    BorderRadius.circular(
                                                      Dimensions.radiusDefault,
                                                    ),
                                                boxShadow: [
                                                  BoxShadow(
                                                    color: Colors.black
                                                        .withOpacity(0.05),
                                                    blurRadius: 5,
                                                    offset: const Offset(0, 2),
                                                  ),
                                                ],
                                              ),
                                              padding: const EdgeInsets.all(
                                                Dimensions.paddingSizeSmall,
                                              ),
                                              child: Row(
                                                mainAxisAlignment:
                                                    MainAxisAlignment
                                                        .spaceBetween,
                                                children: [
                                                  Row(
                                                    children: [
                                                      Container(
                                                        height: 50,
                                                        width: 50,
                                                        decoration: BoxDecoration(
                                                          color: Get
                                                              .theme
                                                              .primaryColor
                                                              .withOpacity(0.1),
                                                          borderRadius:
                                                              BorderRadius.circular(
                                                                Dimensions
                                                                    .radiusDefault,
                                                              ),
                                                        ),
                                                        child: Center(
                                                          child: Image.asset(
                                                            Images
                                                                .onlineBooking,
                                                            height: 30,
                                                            width: 30,
                                                            color: Get
                                                                .theme
                                                                .primaryColor,
                                                          ),
                                                        ),
                                                      ),
                                                      const SizedBox(width: 10),
                                                      Column(
                                                        crossAxisAlignment:
                                                            CrossAxisAlignment
                                                                .start,
                                                        children: [
                                                          Text(
                                                            authController
                                                                .templeDetailsModel!
                                                                .events![index]
                                                                .name
                                                                .toString(),
                                                            style:
                                                                const TextStyle(
                                                                  fontSize: 16,
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .bold,
                                                                  fontFamily:
                                                                      'Georgia',
                                                                ),
                                                          ),
                                                          Text(
                                                            authController
                                                                .templeDetailsModel!
                                                                .events![index]
                                                                .date
                                                                .toString(),
                                                          ),
                                                        ],
                                                      ),
                                                    ],
                                                  ),
                                                  InkWell(
                                                    onTap: () {
                                                      Get.to(
                                                        () =>
                                                            const CreateBookingScreen(),
                                                      );
                                                    },
                                                    child: Container(
                                                      padding:
                                                          const EdgeInsets.symmetric(
                                                            horizontal: 10,
                                                            vertical: 6,
                                                          ),
                                                      decoration: BoxDecoration(
                                                        border: Border.all(
                                                          color: Get
                                                              .theme
                                                              .primaryColor,
                                                        ),
                                                        color: Get
                                                            .theme
                                                            .scaffoldBackgroundColor,
                                                        borderRadius:
                                                            BorderRadius.circular(
                                                              Dimensions
                                                                  .radiusSmall,
                                                            ),
                                                      ),
                                                      child: const Text(
                                                        "Book Now",
                                                        style: TextStyle(
                                                          color: Colors.black,
                                                          fontSize: 12,
                                                          fontWeight:
                                                              FontWeight.w600,
                                                        ),
                                                      ),
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            );
                                          },
                                        )
                                : const SizedBox(),
                            selectedIndex == 3
                                ? (authController
                                                  .templeDetailsModel!
                                                  .heroImages ==
                                              null ||
                                          authController
                                              .templeDetailsModel!
                                              .heroImages!
                                              .isEmpty)
                                      ? const Center(
                                          child: Padding(
                                            padding: EdgeInsets.symmetric(
                                              vertical: 20,
                                            ),
                                            child: Text(
                                              "No Gallery Images Found",
                                              style: TextStyle(
                                                color: Colors.grey,
                                              ),
                                            ),
                                          ),
                                        )
                                      : GridView.builder(
                                          padding: EdgeInsets.zero,
                                          shrinkWrap: true,
                                          physics:
                                              const NeverScrollableScrollPhysics(),
                                          itemCount: authController
                                              .templeDetailsModel!
                                              .heroImages!
                                              .length,
                                          gridDelegate:
                                              const SliverGridDelegateWithFixedCrossAxisCount(
                                                crossAxisCount: 2,
                                                childAspectRatio: 0.9,
                                                crossAxisSpacing: 10,
                                                mainAxisSpacing: 10,
                                              ),
                                          itemBuilder: (context, index) {
                                            return ClipRRect(
                                              borderRadius:
                                                  BorderRadius.circular(
                                                    Dimensions.radiusDefault,
                                                  ),
                                              child: Image.network(
                                                AppConstants.baseUrl +
                                                    authController
                                                        .templeDetailsModel!
                                                        .heroImages![index],
                                                fit: BoxFit.cover,
                                                errorBuilder:
                                                    (
                                                      context,
                                                      error,
                                                      stackTrace,
                                                    ) => Container(
                                                      color: Colors.grey[300],
                                                      child: const Icon(
                                                        Icons
                                                            .image_not_supported,
                                                      ),
                                                    ),
                                              ),
                                            );
                                          },
                                        )
                                : const SizedBox(),
                          ],
                        ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
