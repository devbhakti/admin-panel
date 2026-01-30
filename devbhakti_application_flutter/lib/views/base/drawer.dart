import 'package:devbhakti/controller/authcontroller.dart';
import 'package:devbhakti/util/images.dart';
import 'package:devbhakti/views/auth/login.dart';
import 'package:devbhakti/views/dashboard/dashboard.dart';
import 'package:devbhakti/views/profile/profile.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ModernDrawer extends StatefulWidget {
  const ModernDrawer({super.key});

  @override
  State<ModernDrawer> createState() => _ModernDrawerState();
}

class _ModernDrawerState extends State<ModernDrawer> {



  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return GetBuilder<AuthController>(
      builder: (authController) {
        return Drawer(
          backgroundColor: Colors.white,
          child: Column(
            children: [
              // --- Header Section ---
              Container(
                padding: EdgeInsets.only(
                    top: MediaQuery.of(context).padding.top + 20,
                    bottom: 30,
                    left: 20,
                    right: 20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      theme.primaryColor, // Your Primary Color
                      theme.primaryColor.withOpacity(0.7),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Row(
                  children: [
                    // Avatar
                    CircleAvatar(
                      radius: 30,
                      backgroundColor: Colors.white,
                      backgroundImage: NetworkImage(
                        authController.userModel!.user!.profileImage == null
                            ? "https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2558760599.jpg"
                            : authController.userModel!.user!.profileImage!,
                      ),
                      onBackgroundImageError: (_, __) {},
                    ),

                    SizedBox(width: 15),
                    // User Info
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                      authController.userModel!.user!.name.toString(),
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(height: 4),
                          Text(
                            authController.userModel!.user!.phone.toString(),

                            style: TextStyle(
                              color: Colors.white.withOpacity(0.8),
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Edit Icon
                    InkWell(
                        onTap: (){
                          Get.to(()=>Profile());

                        },

                        child: Icon(Icons.edit, color: Colors.white70)),
                  ],
                ),
              ),



              // --- Bottom Support & Logout ---
              Column(
                children: [
                  ListTile(
                    leading: Icon(Icons.home, color: Colors.grey[700]),
                    title: Text(
                      "Home",
                      style: TextStyle(color: Colors.black87, fontWeight: FontWeight.w500),
                    ),
                    trailing: Icon(Icons.arrow_forward_ios, size: 14, color: Colors.grey),
                    onTap: () {
                      Get.offAll(() => const Dashboard(index: 2));

                    },
                  ),

                  ListTile(
                    leading: Icon(Icons.library_books),
                    title: Text(
                      "Orders",
                      style: TextStyle(color: Colors.black87, fontWeight: FontWeight.w500),
                    ),
                    trailing: Icon(Icons.arrow_forward_ios, size: 14, color: Colors.grey),
                    onTap: () {
                      Get.offAll(() => const Dashboard(index: 3));

                    },
                  ),ListTile(
                    leading: Icon(Icons.book),
                    title: Text(
                      "Bookings",
                      style: TextStyle(color: Colors.black87, fontWeight: FontWeight.w500),
                    ),
                    trailing: Icon(Icons.arrow_forward_ios, size: 14, color: Colors.grey),
                    onTap: () {
                      // Get.offAll(() => const Dashboard(index: 3));

                    },
                  ),

                  ListTile(
                    leading: Icon(Icons.help_outline, color: Colors.grey[700]),
                    title: Text(
                      "Help & Support",
                      style: TextStyle(color: Colors.black87, fontWeight: FontWeight.w500),
                    ),
                    trailing: Icon(Icons.arrow_forward_ios, size: 14, color: Colors.grey),
                    onTap: () {},
                  ),  ListTile(
                    leading: Icon(Icons.library_books, color: Colors.grey[700]),
                    title: Text(
                      "Term & Conditions",
                      style: TextStyle(color: Colors.black87, fontWeight: FontWeight.w500),
                    ),
                    trailing: Icon(Icons.arrow_forward_ios, size: 14, color: Colors.grey),
                    onTap: () {},
                  ),ListTile(
                    leading: Icon(Icons.library_books, color: Colors.grey[700]),
                    title: Text(
                      "Privacy Policy",
                      style: TextStyle(color: Colors.black87, fontWeight: FontWeight.w500),
                    ),
                    trailing: Icon(Icons.arrow_forward_ios, size: 14, color: Colors.grey),
                    onTap: () {},
                  ),
                  ListTile(
                    leading: Icon(Icons.logout, color: Colors.red),
                    title: Text(
                      "Logout",
                      style: TextStyle(
                        color: Colors.red,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    onTap: () {
                      _showLogoutDialog(context);
                    },
                  ),
                  SizedBox(height: 20), // Bottom spacing
                ],
              ),
            ],
          ),
        );
      }
    );
  }



  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
        title: Text("Logout?"),
        content: Text("Are you sure you want to logout?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text("Cancel", style: TextStyle(color: Colors.grey)),
          ),
          TextButton(
            onPressed: () {
         Get.offAll(()=>LoginScreen());
            },
            child: Text("Yes, Logout", style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}

// Helper Class
class DrawerItem {
  final IconData icon;
  final String title;

  DrawerItem({required this.icon, required this.title});
}