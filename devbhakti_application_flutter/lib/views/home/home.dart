import 'package:audioplayers/audioplayers.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:devbhakti/controller/authcontroller.dart';
import 'package:devbhakti/util/app_constants.dart';
import 'package:devbhakti/util/dimensions.dart';
import 'package:devbhakti/util/images.dart';
import 'package:devbhakti/views/base/button.dart';
import 'package:devbhakti/views/base/button2.dart';
import 'package:devbhakti/views/base/drawer.dart';
import 'package:devbhakti/views/cart/cart.dart';
import 'package:devbhakti/views/donation/donation.dart';
import 'package:devbhakti/views/home/temple_detail.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'home_shimmer.dart';

import '../cart/order_successfull.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ScrollController _scrollController = ScrollController();
  bool _showGreeting = true;
  List banners = [
    "https://www.distacart.com/cdn/shop/articles/Web_blog_Essential_Pooja_Samagri-229065_ecd013f1-2018-4f4b-99d5-5ec14e29f70a_1280x.jpg?v=1752574226",
    "https://aapkapandit.com/wp-content/uploads/2024/08/Mobile-Banner-2.jpg",

    "https://www.onlinepathpuja.com/assets/images/category-banner/category_banner_PP-02.jpg",
  ];
  List images = [
    "https://devbhakti.koubcafe.in/_next/static/media/temple-kashi.36ab7a78.jpg",
    "https://devbhakti.koubcafe.in/_next/static/media/temple-tirupati.26682397.jpg",

    "https://devbhakti.koubcafe.in/_next/static/media/temple-siddhivinayak.98d2674b.jpg",
    "https://devbhakti.koubcafe.in/_next/static/media/temple-meenakshi.61ecd540.jpg",
  ];
  List name = [
    "Kashi Vishwanath Temple",
    "Tirupati Balaji Temple",
    "Siddhivinayak Temple",
    "Meenakshi Amman Temple",
  ];

  List imagesProduct = [
    "https://devbhakti.koubcafe.in/_next/static/media/product-rudraksha.24797be6.jpg",
    "https://devbhakti.koubcafe.in/_next/static/media/product-diya.af1183ee.jpg",
    "https://devbhakti.koubcafe.in/_next/static/media/product-incense.341bb1a5.jpg",
    "https://devbhakti.koubcafe.in/_next/static/media/product-gangajal.0b3fa203.jpg",
  ];
  List nameProduct = [
    "Sacred Rudraksha Mala",
    "Traditional Brass Diya",
    "Premium Incense Sticks",
    "Holy Gangajal",
  ];

  final List<String> knows = [
    "Moksha",
    "wealth",
    "success",
    "harmonious relationships",
  ];
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  final AudioPlayer _audioPlayer = AudioPlayer();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_handleScroll);
    playSound();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Get.find<AuthController>().temples();
      Get.find<AuthController>().pooja();
      Get.find<AuthController>().banners();
      Get.find<AuthController>().getUser();
    });
  }

  void _handleScroll() {
    if (_scrollController.offset > 10 && _showGreeting) {
      setState(() => _showGreeting = false);
    }
  }

  void playSound() async {
    await _audioPlayer.play(AssetSource('images/Temple bell sound.mp3'));
  }

  @override
  void dispose() {
    _scrollController.removeListener(_handleScroll);
    _scrollController.dispose();
    _audioPlayer.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        key: _scaffoldKey,

        // 2. Define the End Drawer
        endDrawer: ModernDrawer(),

        backgroundColor: Color(0xFFF9F9F9),

        body: GetBuilder<AuthController>(
          builder: (authController) {
            return RefreshIndicator(
              onRefresh: () async {
                await authController.temples();
                await authController.pooja();
                await authController.banners();
                await authController.getUser();
              },
              child: CustomScrollView(
                controller: _scrollController,
                physics: const AlwaysScrollableScrollPhysics(),
                slivers: [
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: _showGreeting
                          ? const EdgeInsets.all(Dimensions.paddingSizeDefault)
                          : EdgeInsets.zero,
                      child: _showGreeting
                          ? Column(
                              key: const ValueKey('greeting'),
                              children: [
                                AnimatedSwitcher(
                                  duration: const Duration(milliseconds: 200),
                                  transitionBuilder: (child, animation) =>
                                      SizeTransition(
                                        sizeFactor: animation,
                                        child: FadeTransition(
                                          opacity: animation,
                                          child: child,
                                        ),
                                      ),
                                  child: Row(
                                    key: const ValueKey('greeting_row'),
                                    children: [
                                      Image.asset(Images.namaste, height: 24),
                                      Text(
                                        'Namaste, Pratham',
                                        style: TextStyle(
                                          fontFamily: 'Georgia',
                                          fontWeight: FontWeight.bold,
                                          color: Get.theme.primaryColor,
                                          fontSize: 18,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            )
                          : const SizedBox.shrink(key: ValueKey('hidden')),
                    ),
                  ),

                  SliverPersistentHeader(
                    pinned: true,
                    delegate: SearchHeaderDelegate(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 5),
                        child: Row(
                          children: [
                            //
                            // SizedBox(width: 5,),
                            // Image.asset(Images.logo2, height: 35),
                            // SizedBox(width: 10),
                            Expanded(
                              child: Container(
                                height: 40,
                                // padding: EdgeInsets.all(Dimensions.paddingSizeExtraSmall),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadiusGeometry.circular(
                                    30,
                                  ),
                                  border: Border.all(
                                    color: Get.theme.primaryColor,
                                  ),
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
                              onTap: () =>
                                  _scaffoldKey.currentState?.openEndDrawer(),
                              child: Image.asset(Images.options, height: 20),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(0),
                      child: Column(
                        children: [
                          Stack(
                            children: [
                              SizedBox(
                                height: 150,
                                width: Get.width,
                                child: ClipRRect(
                                  child: Image.asset(
                                    Images.login,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                              ),
                              Positioned(
                                child: Container(
                                  height: 150,
                                  width: Get.width,
                                  color: Colors.white.withOpacity(0.7),
                                ),
                              ),
                              Positioned(
                                child: Center(
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      const SizedBox(height: 32),

                                      RichText(
                                        textAlign: TextAlign.center,
                                        text: TextSpan(
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 22,
                                            fontFamily: 'Georgia',
                                            wordSpacing: 3,
                                          ),
                                          children: [
                                            TextSpan(
                                              text:
                                                  "Stay Connected to Your Faith, ",
                                              style: TextStyle(
                                                color: Colors.black,
                                              ),
                                            ),
                                            TextSpan(
                                              text: "Wherever You Are",
                                              style: TextStyle(
                                                foreground: Paint()
                                                  ..shader =
                                                      LinearGradient(
                                                        begin: Alignment
                                                            .centerLeft,
                                                        end: Alignment
                                                            .centerRight,
                                                        colors: [
                                                          Get
                                                              .theme
                                                              .primaryColor,
                                                          Get
                                                              .theme
                                                              .primaryColor,
                                                          Get
                                                              .theme
                                                              .primaryColor,
                                                          Get
                                                              .theme
                                                              .primaryColor,
                                                          Get.theme.primaryColor
                                                              .withOpacity(0.5),
                                                        ],
                                                      ).createShader(
                                                        const Rect.fromLTWH(
                                                          0,
                                                          0,
                                                          300,
                                                          80,
                                                        ), // wider for smooth gradient
                                                      ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      // const SizedBox(height: 15),
                                      Center(
                                        child: Text(
                                          "Discover Trusted Temples, Book Poojas\n& View Live Darshan.",
                                          textAlign: TextAlign.center,
                                          style: TextStyle(
                                            fontSize: 12,
                                            // fontWeight: FontWeight.bold,
                                            color: Colors.black,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(height: 20),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),

                          Padding(
                            padding: EdgeInsets.symmetric(
                              horizontal: Dimensions.paddingSizeDefault,
                              vertical: Dimensions.paddingSizeSmall,
                            ),
                            child: Column(
                              children: [
                                Row(
                                  children: [
                                    Expanded(
                                      child: Container(
                                        height: 30,
                                        decoration: BoxDecoration(
                                          borderRadius: BorderRadius.circular(
                                            Dimensions.radiusSmall,
                                          ),
                                          color: Get.theme.primaryColor,
                                        ),
                                        child: Center(
                                          child: Text(
                                            "Poojas & Sevas",
                                            style: TextStyle(
                                              color: Colors.white,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                    SizedBox(width: 10),
                                    Expanded(
                                      child: Container(
                                        height: 30,
                                        decoration: BoxDecoration(
                                          borderRadius: BorderRadius.circular(
                                            Dimensions.radiusSmall,
                                          ),
                                          color: Get.theme.primaryColor,
                                        ),
                                        child: Center(
                                          child: Text(
                                            "Live Darshan",
                                            style: TextStyle(
                                              color: Colors.white,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                    SizedBox(width: 10),
                                    Expanded(
                                      child: Container(
                                        height: 30,
                                        decoration: BoxDecoration(
                                          borderRadius: BorderRadius.circular(
                                            Dimensions.radiusSmall,
                                          ),
                                          color: Get.theme.primaryColor,
                                        ),
                                        child: Center(
                                          child: Text(
                                            "Sacred Items",
                                            style: TextStyle(
                                              color: Colors.white,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),

                                SizedBox(height: 8),
                                authController.getBannerList.isNotEmpty ? CarouselSlider(
                                  options: CarouselOptions(
                                    height: 180,
                                    autoPlay: true,
                                    autoPlayInterval: const Duration(
                                      seconds: 3,
                                    ),
                                    enlargeCenterPage: false,
                                    viewportFraction: 1.0,
                                  ),
                                  items: authController.getBannerList.map((
                                    image,
                                  ) {
                                    return SizedBox(
                                      width: double.infinity,
                                      child: AspectRatio(
                                        aspectRatio: 16 / 9,
                                        child: ClipRRect(
                                          borderRadius: BorderRadius.circular(
                                            12,
                                          ),
                                          child: Image.network(
                                            AppConstants.baseUrl +
                                                image.image.toString(),
                                            fit: BoxFit.cover,
                                          ),
                                        ),
                                      ),
                                    );
                                  }).toList(),
                                ) : const BannerShimmer(),
                                SizedBox(height: 20),

                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      "Discover Sacred Temples",
                                      style: TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold,
                                        color: Get.theme.primaryColor,
                                      ),
                                    ),
                                    Icon(
                                      Icons.arrow_forward,
                                      color: Get.theme.primaryColor,
                                    ),
                                  ],
                                ),
                                SizedBox(height: 10),
                                authController.getTemplesList.isNotEmpty ?

                                GridView.builder(
                                  padding: EdgeInsets.zero,
                                  shrinkWrap: true,
                                  physics:
                                      NeverScrollableScrollPhysics(), // Prevent nested scrolling issues

                                  itemCount: authController.getTemplesList.length > 4 ? 4 : authController.getTemplesList.length,
                                  gridDelegate:
                                      SliverGridDelegateWithFixedCrossAxisCount(
                                        crossAxisCount: 2,
                                        childAspectRatio: 0.7,
                                        crossAxisSpacing: 20,
                                        mainAxisSpacing: 20,
                                      ),
                                  itemBuilder: (context, index) {
                                    return InkWell(
                                      onTap: () {
                                        Get.to(
                                          () => TempleDetail(
                                            id:
                                                authController
                                                    .getTemplesList[index]
                                                    .id
                                                    .toString(),
                                            image:
                                                AppConstants.baseUrl +
                                                authController
                                                    .getTemplesList[index]
                                                    .image
                                                    .toString(),
                                            name: authController
                                                .getTemplesList[index]
                                                .name
                                                .toString(),
                                          ),
                                        );
                                      },
                                      child: Stack(
                                        children: [
                                          Container(
                                            decoration: BoxDecoration(
                                              color: Colors.white,
                                              borderRadius:
                                                  BorderRadius.circular(
                                                    Dimensions.radiusDefault,
                                                  ),
                                              boxShadow: [
                                                BoxShadow(
                                                  color: Colors.black
                                                      .withOpacity(
                                                        0.08,
                                                      ), // Softer shadow
                                                  blurRadius: 8,
                                                  spreadRadius: 1,
                                                ),
                                              ],
                                            ),
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                // Image Section
                                                SizedBox(
                                                  width: double.infinity,
                                                  child: LayoutBuilder(
                                                    builder: (context, constraints) {
                                                      return SizedBox(
                                                        height:
                                                            constraints
                                                                .maxWidth *
                                                            0.8, // Maintains aspect ratio
                                                        child: Stack(
                                                          children: [
                                                            ClipRRect(
                                                              borderRadius: const BorderRadius.only(
                                                                topLeft:
                                                                    Radius.circular(
                                                                      Dimensions
                                                                          .radiusDefault,
                                                                    ),
                                                                topRight:
                                                                    Radius.circular(
                                                                      Dimensions
                                                                          .radiusDefault,
                                                                    ),
                                                              ),
                                                              child: SizedBox(
                                                                width: double
                                                                    .infinity,
                                                                child: Image.network(
                                                                  AppConstants
                                                                          .baseUrl +
                                                                      authController
                                                                          .getTemplesList[index]
                                                                          .image
                                                                          .toString(),
                                                                  fit: BoxFit
                                                                      .cover,
                                                                  errorBuilder:
                                                                      (
                                                                        context,
                                                                        error,
                                                                        stackTrace,
                                                                      ) {
                                                                        return Container(
                                                                          color:
                                                                              Colors.grey[300],
                                                                          child: const Center(
                                                                            child: Icon(
                                                                              Icons.broken_image,
                                                                            ),
                                                                          ),
                                                                        );
                                                                      },
                                                                ),
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
                                                    padding:
                                                        const EdgeInsets.all(
                                                          10.0,
                                                        ),
                                                    child: Column(
                                                      crossAxisAlignment:
                                                          CrossAxisAlignment
                                                              .start,
                                                      mainAxisAlignment:
                                                          MainAxisAlignment
                                                              .spaceBetween,
                                                      children: [
                                                        // Title and Location
                                                        Column(
                                                          crossAxisAlignment:
                                                              CrossAxisAlignment
                                                                  .start,
                                                          children: [
                                                            Text(
                                                              authController
                                                                  .getTemplesList[index]
                                                                  .name
                                                                  .toString(),

                                                              style: const TextStyle(
                                                                color: Colors
                                                                    .black87,
                                                                fontSize: 15,
                                                                fontWeight:
                                                                    FontWeight
                                                                        .bold,
                                                              ),
                                                              maxLines: 1,
                                                              overflow:
                                                                  TextOverflow
                                                                      .ellipsis,
                                                            ),
                                                            const SizedBox(
                                                              height: 4,
                                                            ),
                                                            Text(
                                                              "Temple is Known For ",
                                                              style: const TextStyle(
                                                                color: Colors
                                                                    .black87,
                                                                fontSize: 12,
                                                                // fontWeight: FontWeight.bold,
                                                              ),
                                                              maxLines: 2,
                                                              overflow:
                                                                  TextOverflow
                                                                      .ellipsis,
                                                            ),
                                                            const SizedBox(
                                                              height: 4,
                                                            ),
                                                          ],
                                                        ),

                                                        // Stats (Rating and Time)
                                                        Row(
                                                          mainAxisAlignment:
                                                              MainAxisAlignment
                                                                  .spaceBetween,
                                                          children: [
                                                            Row(
                                                              children: [
                                                                const Icon(
                                                                  Icons.star,
                                                                  color: Colors
                                                                      .orange,
                                                                  size: 16,
                                                                ),
                                                                const SizedBox(
                                                                  width: 4,
                                                                ),
                                                                Text(
                                                                  "4.9",
                                                                  style: const TextStyle(
                                                                    fontSize:
                                                                        13,
                                                                    fontWeight:
                                                                        FontWeight
                                                                            .w600,
                                                                  ),
                                                                ),
                                                                Text(
                                                                  " (12.5k)",
                                                                  style: TextStyle(
                                                                    color: Colors
                                                                        .grey[600],
                                                                    fontSize:
                                                                        11,
                                                                  ),
                                                                ),
                                                              ],
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
                                                    .getTemplesList[index].isFavorite==true?
                                                Get.find<AuthController>()
                                                    .removeFavourite(
                                                  id: authController
                                                      .getTemplesList[index]
                                                      .id!,
                                                ).then((_){
                                                  authController.temples();
                                                })
                                                    :


                                                Get.find<AuthController>()
                                                    .addFavourite(
                                                  id: authController
                                                      .getTemplesList[index]
                                                      .id!,
                                                ).then((_){
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


                                                    authController
                                                        .getTemplesList[index]
                                                        .isFavorite==false?
                                                    Icons.favorite_border:
                                                    Icons.favorite,
                                                    color:
                                                        Get.theme.primaryColor,
                                                    size: 15,
                                                  ),
                                                ),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    );
                                  },
                                ) : const TempleGridShimmer(),

                                SizedBox(height: 20),
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      "Book Poojas & Aarti",
                                      style: TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold,
                                        color: Get.theme.primaryColor,
                                      ),
                                    ),
                                    Icon(
                                      Icons.arrow_forward,
                                      color: Get.theme.primaryColor,
                                    ),
                                  ],
                                ),

                                SizedBox(height: 10),

                                authController.getPoojaList.isNotEmpty ? SizedBox(
                                  height: 250,
                                  child: ListView.builder(
                                    scrollDirection: Axis.horizontal,
                                    itemCount:
                                        authController.getPoojaList.length,
                                    itemBuilder: (context, index) {
                                      return Container(
                                        margin: EdgeInsets.only(right: 10),
                                        height: 250,
                                        width: 220,
                                        decoration: BoxDecoration(
                                          borderRadius: BorderRadius.circular(
                                            12,
                                          ),
                                        ),
                                        child: ClipRRect(
                                          borderRadius: BorderRadius.circular(
                                            12,
                                          ),
                                          child: Stack(
                                            fit: StackFit.expand,
                                            children: [
                                              Image.network(
                                                AppConstants.baseUrl +
                                                    authController
                                                        .getPoojaList[index]
                                                        .image
                                                        .toString(),
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
                                                      Colors.black.withOpacity(
                                                        1,
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ),

                                              Positioned(
                                                right: 10,
                                                top: 10,
                                                child: Column(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.end,
                                                  children: [
                                                    Text(
                                                      authController
                                                          .getPoojaList[index]
                                                          .name
                                                          .toString(),
                                                      style: TextStyle(
                                                        color: Colors.white,
                                                        fontWeight:
                                                            FontWeight.bold,

                                                        fontFamily: 'Georgia',
                                                      ),
                                                    ),
                                                    Text(
                                                      "Early morning blessing",
                                                      style: TextStyle(
                                                        color: Colors.white,
                                                        fontSize: 12,
                                                        // fontWeight: FontWeight.bold,

                                                        // fontFamily: 'Georgia',
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                              Positioned(
                                                left: 10,
                                                bottom: 10,
                                                child: Column(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.start,
                                                  children: [
                                                    Row(
                                                      children: [
                                                        Icon(
                                                          CupertinoIcons.clock,
                                                          color: Colors.white,
                                                          size: 15,
                                                        ),
                                                        Text(
                                                          " ${authController.getPoojaList[index].duration.toString()} min",
                                                          style: TextStyle(
                                                            color: Colors.white,
                                                            fontSize: 12,
                                                          ),
                                                        ),
                                                        Text(
                                                          "  • 05:00 AM",
                                                          style: TextStyle(
                                                            color: Colors.white,
                                                            fontSize: 12,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                    SizedBox(
                                                      width: Get.width / 2 - 10,
                                                      child: Divider(
                                                        color: Colors.white,
                                                        thickness: 0.5,
                                                      ),
                                                    ),
                                                    Text(
                                                      "₹ ${authController.getPoojaList[index].price.toString()}",
                                                      style: TextStyle(
                                                        color: Colors.white,
                                                        fontWeight:
                                                            FontWeight.bold,
                                                        fontSize: 18,

                                                        // fontFamily: 'Georgia',
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                              Positioned(
                                                right: 10,
                                                bottom: 10,
                                                child: Column(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.start,
                                                  children: [
                                                    Text(
                                                      "Book now",
                                                      style: TextStyle(
                                                        color: Colors.white,
                                                        fontWeight:
                                                            FontWeight.bold,
                                                        fontSize: 12,

                                                        // fontFamily: 'Georgia',
                                                      ),
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
                                ) : const PoojaListShimmer(),

                                SizedBox(height: 20),

                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      "Live Darshan",
                                      style: TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold,
                                        color: Get.theme.primaryColor,
                                      ),
                                    ),
                                    Icon(
                                      Icons.arrow_forward,
                                      color: Get.theme.primaryColor,
                                    ),
                                  ],
                                ),
                                SizedBox(height: 10),

                                authController.getTemplesList.isNotEmpty ? CarouselSlider.builder(
                                  itemCount: 2,
                                  options: CarouselOptions(
                                    height: 280,
                                    aspectRatio: 16 / 9,
                                    viewportFraction: 0.65,
                                    initialPage: 0,
                                    enableInfiniteScroll: true,
                                    reverse: false,
                                    autoPlay: false,
                                    autoPlayInterval: Duration(seconds: 3),
                                    autoPlayAnimationDuration: Duration(
                                      milliseconds: 800,
                                    ),
                                    autoPlayCurve: Curves.fastOutSlowIn,
                                    enlargeCenterPage: true,
                                    scrollDirection: Axis.horizontal,
                                    padEnds: true,
                                  ),
                                  itemBuilder: (context, index, realIndex) {
                                    return InkWell(
                                      onTap: () {
                                        Get.to(
                                          () => TempleDetail(
                                            id:
                                                authController
                                                    .getTemplesList[index]
                                                    .id
                                                    .toString(),
                                            image: images[index],
                                            name: name[index],
                                          ),
                                        );
                                      },
                                      child: Stack(
                                        children: [
                                          Container(
                                            // Container takes available width defined by viewportFraction
                                            width: double.infinity,
                                            decoration: BoxDecoration(
                                              color: Colors.white,
                                              borderRadius:
                                                  BorderRadius.circular(
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
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                // Image Section
                                                SizedBox(
                                                  height: 170,
                                                  width: double
                                                      .infinity, // Fits the card width
                                                  child: ClipRRect(
                                                    borderRadius: BorderRadius.only(
                                                      topLeft: Radius.circular(
                                                        Dimensions
                                                            .radiusDefault,
                                                      ),
                                                      topRight: Radius.circular(
                                                        Dimensions
                                                            .radiusDefault,
                                                      ),
                                                    ),
                                                    child: Image.network(
                                                      images[index],
                                                      fit: BoxFit.cover,
                                                      errorBuilder:
                                                          (
                                                            context,
                                                            error,
                                                            stackTrace,
                                                          ) => Container(
                                                            color: Colors
                                                                .grey[200],
                                                            child: Icon(
                                                              Icons
                                                                  .broken_image,
                                                            ),
                                                          ),
                                                    ),
                                                  ),
                                                ),
                                                // Text Content Section
                                                Padding(
                                                  padding: const EdgeInsets.all(
                                                    8.0,
                                                  ),
                                                  child: Column(
                                                    crossAxisAlignment:
                                                        CrossAxisAlignment
                                                            .start,
                                                    children: [
                                                      Text(
                                                        name[index],
                                                        style: TextStyle(
                                                          color: Colors.black,
                                                          fontSize: 16,
                                                          fontWeight:
                                                              FontWeight.bold,
                                                        ),
                                                        maxLines: 1,
                                                        overflow: TextOverflow
                                                            .ellipsis,
                                                      ),
                                                      SizedBox(height: 4),

                                                      Text(
                                                        "Temple is Known For ${knows[index]}",
                                                        style: const TextStyle(
                                                          color: Colors.black87,
                                                          fontSize: 12,
                                                          // fontWeight: FontWeight.bold,
                                                        ),
                                                        maxLines: 2,
                                                        overflow: TextOverflow
                                                            .ellipsis,
                                                      ),
                                                      SizedBox(height: 4),
                                                      Row(
                                                        children: [
                                                          Icon(
                                                            Icons
                                                                .location_on_outlined,
                                                            color: Colors.grey,
                                                            size: 20,
                                                          ),
                                                          SizedBox(width: 4),
                                                          Text("varanasi UP"),
                                                        ],
                                                      ),
                                                    ],
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
                                                color: Colors.white.withOpacity(
                                                  0.5,
                                                ),
                                              ),
                                              child: Center(
                                                child: Icon(
                                                  Icons.favorite_border,
                                                  color: Get.theme.primaryColor,
                                                  size: 15,
                                                ),
                                              ),
                                            ),
                                          ),

                                          // Live Badge
                                          Positioned(
                                            top: 10,
                                            left: 5,
                                            child: Container(
                                              padding: EdgeInsets.symmetric(
                                                horizontal: 8,
                                                vertical: 2,
                                              ),
                                              decoration: BoxDecoration(
                                                borderRadius:
                                                    BorderRadius.circular(20),
                                                color: Colors.red.withOpacity(
                                                  0.5,
                                                ),
                                              ),
                                              child: Center(
                                                child: Text(
                                                  "Live",
                                                  style: TextStyle(
                                                    color: Colors.white,
                                                  ),
                                                ),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    );
                                  },
                                ) : const LiveDarshanShimmer(),

                                SizedBox(height: 20),
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      "Devotional Products",
                                      style: TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold,
                                        color: Get.theme.primaryColor,
                                      ),
                                    ),
                                    Icon(
                                      Icons.arrow_forward,
                                      color: Get.theme.primaryColor,
                                    ),
                                  ],
                                ),
                                SizedBox(height: 10),

                                SizedBox(
                                  height:
                                      436, // Increased height to fit content properly
                                  width: Get.width,
                                  child: ListView.builder(
                                    itemCount: imagesProduct.length,
                                    scrollDirection: Axis.horizontal,
                                    itemExtent: 240,
                                    padding: EdgeInsets.symmetric(
                                      horizontal: 5,
                                    ), // Small side padding
                                    itemBuilder: (context, index) {
                                      return Padding(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 5.0,
                                        ), // Spacing between cards
                                        child: InkWell(
                                          onTap: () {
                                            // Get.to(() => TempleDetail(image: imagesProduct[index], name: nameProduct[index]));
                                          },
                                          borderRadius: BorderRadius.circular(
                                            20,
                                          ),
                                          child: Container(
                                            width:
                                                240, // Explicit width for the card content
                                            decoration: BoxDecoration(
                                              color: Colors.white,
                                              borderRadius:
                                                  BorderRadius.circular(20),
                                              boxShadow: [
                                                BoxShadow(
                                                  color: Colors.black
                                                      .withOpacity(0.06),
                                                  blurRadius: 15,
                                                  offset: Offset(0, 5),
                                                ),
                                              ],
                                            ),
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                // Image Section with Discount Badge
                                                Stack(
                                                  children: [
                                                    ClipRRect(
                                                      borderRadius:
                                                          BorderRadius.only(
                                                            topLeft:
                                                                Radius.circular(
                                                                  20,
                                                                ),
                                                            topRight:
                                                                Radius.circular(
                                                                  20,
                                                                ),
                                                          ),
                                                      child: SizedBox(
                                                        width: double.infinity,
                                                        child: Image.network(
                                                          imagesProduct[index],
                                                          height:
                                                              240, // Adjusted height for better proportion
                                                          fit: BoxFit.cover,
                                                          errorBuilder:
                                                              (
                                                                context,
                                                                error,
                                                                stackTrace,
                                                              ) {
                                                                return Container(
                                                                  height: 140,
                                                                  color: Colors
                                                                      .grey[200],
                                                                  child: Icon(
                                                                    Icons
                                                                        .broken_image,
                                                                    size: 50,
                                                                    color: Colors
                                                                        .grey,
                                                                  ),
                                                                );
                                                              },
                                                        ),
                                                      ),
                                                    ),
                                                    Positioned(
                                                      top: 10,
                                                      left: 10,
                                                      child: Container(
                                                        padding:
                                                            EdgeInsets.symmetric(
                                                              horizontal: 8,
                                                              vertical: 4,
                                                            ),
                                                        decoration: BoxDecoration(
                                                          color: Colors
                                                              .redAccent
                                                              .withOpacity(0.9),
                                                          borderRadius:
                                                              BorderRadius.circular(
                                                                8,
                                                              ),
                                                        ),
                                                        child: Text(
                                                          "-35%",
                                                          style: TextStyle(
                                                            color: Colors.white,
                                                            fontSize: 10,
                                                            fontWeight:
                                                                FontWeight.bold,
                                                          ),
                                                        ),
                                                      ),
                                                    ),
                                                    Positioned(
                                                      top: 10,
                                                      right: 10,
                                                      child: Container(
                                                        padding: EdgeInsets.all(
                                                          5,
                                                        ),
                                                        decoration:
                                                            BoxDecoration(
                                                              shape: BoxShape
                                                                  .circle,
                                                              color: Colors
                                                                  .white
                                                                  .withOpacity(
                                                                    0.5,
                                                                  ),
                                                            ),
                                                        child: Center(
                                                          child: Icon(
                                                            Icons
                                                                .favorite_border,
                                                            color: Get
                                                                .theme
                                                                .primaryColor,
                                                            size: 15,
                                                          ),
                                                        ),
                                                      ),
                                                    ),
                                                  ],
                                                ),

                                                // Content Section
                                                Expanded(
                                                  // Use Expanded to push content nicely or just standard padding
                                                  child: Padding(
                                                    padding:
                                                        const EdgeInsets.all(
                                                          12.0,
                                                        ),
                                                    child: Column(
                                                      crossAxisAlignment:
                                                          CrossAxisAlignment
                                                              .start,
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
                                                              "Prayer Beads",
                                                              style: TextStyle(
                                                                fontSize: 14,
                                                                color: Get
                                                                    .theme
                                                                    .primaryColor,
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w600,
                                                                letterSpacing:
                                                                    0.5,
                                                              ),
                                                            ),

                                                            SizedBox(height: 4),

                                                            Text(
                                                              nameProduct[index],
                                                              style: TextStyle(
                                                                color: Colors
                                                                    .black87,
                                                                fontSize: 16,
                                                                fontWeight:
                                                                    FontWeight
                                                                        .bold,
                                                                height: 1.2,
                                                              ),
                                                              maxLines: 1,
                                                              overflow:
                                                                  TextOverflow
                                                                      .ellipsis,
                                                            ),

                                                            SizedBox(height: 4),

                                                            // Description
                                                            Text(
                                                              "Authentic Rudraksha mala for meditation & peace.",
                                                              maxLines: 2,
                                                              overflow:
                                                                  TextOverflow
                                                                      .ellipsis,
                                                              style: TextStyle(
                                                                fontSize: 12,
                                                                color: Colors
                                                                    .grey[600],
                                                                height: 1.3,
                                                              ),
                                                            ),
                                                            SizedBox(height: 5),
                                                            Row(
                                                              mainAxisAlignment:
                                                                  MainAxisAlignment
                                                                      .spaceBetween,
                                                              children: [
                                                                Row(
                                                                  children: [
                                                                    Icon(
                                                                      Icons
                                                                          .star,
                                                                      color: Colors
                                                                          .yellow,
                                                                    ),
                                                                    Row(
                                                                      children: [
                                                                        Text(
                                                                          "4.9 ",
                                                                        ),
                                                                        Text(
                                                                          "(12,500)",
                                                                          style: TextStyle(
                                                                            color:
                                                                                Colors.grey,
                                                                          ),
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

                                                        SizedBox(height: 8),

                                                        // Price and Action
                                                        Row(
                                                          mainAxisAlignment:
                                                              MainAxisAlignment
                                                                  .spaceBetween,
                                                          crossAxisAlignment:
                                                              CrossAxisAlignment
                                                                  .center,
                                                          children: [
                                                            // Price Column (Removed unnecessary nesting)
                                                            Column(
                                                              crossAxisAlignment:
                                                                  CrossAxisAlignment
                                                                      .start,
                                                              children: [
                                                                Row(
                                                                  children: [
                                                                    Text(
                                                                      "₹1299",
                                                                      style: TextStyle(
                                                                        fontSize:
                                                                            14,
                                                                        fontWeight:
                                                                            FontWeight.bold,
                                                                        color: Colors
                                                                            .black87,
                                                                      ),
                                                                    ),
                                                                    SizedBox(
                                                                      width: 6,
                                                                    ),
                                                                    Text(
                                                                      "₹1999",
                                                                      style: TextStyle(
                                                                        fontSize:
                                                                            10,
                                                                        color: Colors
                                                                            .grey,
                                                                        decoration:
                                                                            TextDecoration.lineThrough,
                                                                      ),
                                                                    ),
                                                                  ],
                                                                ),
                                                              ],
                                                            ),
                                                            // Add Button
                                                            InkWell(
                                                              onTap: () {
                                                                Get.to(
                                                                  () =>
                                                                      CartScreen(),
                                                                );
                                                              },
                                                              borderRadius:
                                                                  BorderRadius.circular(
                                                                    8,
                                                                  ),
                                                              child: Container(
                                                                padding:
                                                                    EdgeInsets.symmetric(
                                                                      horizontal:
                                                                          12,
                                                                      vertical:
                                                                          6,
                                                                    ),
                                                                decoration: BoxDecoration(
                                                                  color: Get
                                                                      .theme
                                                                      .primaryColor,
                                                                  borderRadius:
                                                                      BorderRadius.circular(
                                                                        8,
                                                                      ),
                                                                  boxShadow: [
                                                                    BoxShadow(
                                                                      color: Get
                                                                          .theme
                                                                          .primaryColor
                                                                          .withOpacity(
                                                                            0.4,
                                                                          ),
                                                                      blurRadius:
                                                                          8,
                                                                      offset:
                                                                          Offset(
                                                                            0,
                                                                            4,
                                                                          ),
                                                                    ),
                                                                  ],
                                                                ),
                                                                child: Text(
                                                                  "Add",
                                                                  style: TextStyle(
                                                                    color: Colors
                                                                        .white,
                                                                    fontSize:
                                                                        12,
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
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
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
  double get maxExtent => 60.0;

  @override
  double get minExtent => 60.0;

  @override
  bool shouldRebuild(covariant SearchHeaderDelegate oldDelegate) {
    return false;
  }
}
