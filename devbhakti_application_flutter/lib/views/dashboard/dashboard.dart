import 'package:curved_navigation_bar/curved_navigation_bar.dart';
import 'package:devbhakti/controller/authcontroller.dart';
import 'package:devbhakti/views/live_darshan/live_darshan.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../util/images.dart';
import '../bookings/booking.dart';
import '../divine/divine.dart';
import '../home/home.dart';
import '../temple/temple.dart';

class Dashboard extends StatefulWidget {
  final int? index;
  const Dashboard({super.key, this.index});

  @override
  State<Dashboard> createState() => _DashboardState();
}

class _DashboardState extends State<Dashboard> {
  int _currentIndex = 2;

  final List<Widget> _screens = const [
    TempleScreen(),
    Bookings(),
    HomeScreen(),
    LiveDarshan(),
    DivineScreen(),
  ];

  @override
  void initState() {

 WidgetsBinding.instance.addPostFrameCallback((_){

   Get.find<AuthController>().getUser();
 })
;    super.initState();
    _currentIndex = widget.index ?? 2;
  }

  /// Bottom navigation icon widget
  Widget navIcon(String image, int index, String text) {
    bool isSelected = _currentIndex == index;

    return AnimatedScale(
      scale: isSelected ? 1.15 : 1.0,
      duration: const Duration(milliseconds: 200),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Image.asset(
            image,
            height: index == 2 ? 28 : 26,
            color: index == 2
                ? null // Home keeps original color
                : (isSelected ? Colors.white : Colors.grey[600]),
          ),
           SizedBox(height:isSelected?0: 4),
          isSelected?SizedBox():      Text(
           text,
            style: TextStyle(
              fontSize: 11,
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.w600,
              color: isSelected
                  ? (index == 2 ? Colors.black : Colors.white)
                  : Colors.black,
            ),
          ),
        ],
      ),
    );
  }


  @override
  Widget build(BuildContext context) {
    final primaryColor = Theme.of(context).primaryColor;

    return Scaffold(
      extendBody: true,

      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),

      bottomNavigationBar: CurvedNavigationBar(
        index: _currentIndex,
        height: 68,
        backgroundColor: Colors.transparent,
        color: Colors.white,
        buttonBackgroundColor: primaryColor,
        animationDuration: const Duration(milliseconds: 350),
        letIndexChange: (index) => index != 1,

        items: [
          navIcon(Images.temple, 0,"Temple"),
          navIcon(Images.deep, 1,"Poojas"),
          navIcon(Images.logo2, 2,"Home"),

          navIcon(Images.namaste, 3,"Darshan"),
          navIcon(Images.pooja, 4,"Shop"),
        ],

        onTap: (index) {
          // Disable Bookings tab (index 1)
          if (index == 1) return;

          setState(() {
            _currentIndex = index;
          });
        },

      ),
    );
  }
}
