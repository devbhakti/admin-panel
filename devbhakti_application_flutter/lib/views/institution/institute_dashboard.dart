import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:curved_navigation_bar/curved_navigation_bar.dart';
import 'institute_home.dart';
import 'institution_profile_screen.dart';
import 'institution_service_screen.dart';
import 'institution_announcement_screen.dart';
import 'institution_booking_screen.dart';

class InstituteDashboard extends StatefulWidget {
  const InstituteDashboard({super.key});

  @override
  State<InstituteDashboard> createState() => _InstituteDashboardState();
}

class _InstituteDashboardState extends State<InstituteDashboard> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    InstituteHome(),
    InstitutionServiceScreen(),
    InstitutionBookingScreen(),
    InstitutionProfileScreen(),


  ];

  final List<String> _titles = [
    "Home",
    "Poojas",
    "Bookings",
    "Profile",

  ];

  final List<IconData> _icons = [
    Icons.home,
    Icons.auto_awesome_outlined,
    Icons.event_note_outlined,
    Icons.person,
  ];

  @override
  Widget build(BuildContext context) {
    final primaryColor = Theme.of(context).primaryColor;

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: CurvedNavigationBar(
        index: _currentIndex,
        height: 65,
        items: List.generate(_icons.length, (index) {
          bool isSelected = _currentIndex == index;
          return Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                _icons[index],
                size: 26,
                color: isSelected ? Colors.white : Colors.grey[700],
              ),
              if (!isSelected)
                Text(
                  _titles[index],
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: Colors.grey[800],
                  ),
                ),
            ],
          );
        }),
        color: Colors.white,
        buttonBackgroundColor: primaryColor,
        backgroundColor: Colors.transparent,
        animationCurve: Curves.easeInOut,
        animationDuration: const Duration(milliseconds: 300),
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
      ),
    );
  }
}
