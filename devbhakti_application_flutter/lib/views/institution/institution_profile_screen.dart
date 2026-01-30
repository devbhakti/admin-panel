import 'package:devbhakti/controller/authcontroller.dart';
import 'package:devbhakti/util/images.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
class InstitutionProfileScreen extends StatefulWidget {
  const InstitutionProfileScreen({super.key});

  @override
  State<InstitutionProfileScreen> createState() => _InstitutionProfileScreenState();
}

class _InstitutionProfileScreenState extends State<InstitutionProfileScreen> {

  @override
  void initState() {
    Get.find<AuthController>().getUser();

    // TODO: implement initState
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FB),
      appBar: AppBar(
        title: const Text("My Profile", style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF2D3E50),
        elevation: 0,
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.edit_note_rounded, size: 28),
          ),
        ],
      ),
      body: GetBuilder<AuthController>(
        builder: (authController) {
          if (authController.userModel == null || authController.userModel!.user == null) {
            return const Center(child: CircularProgressIndicator());
          }

          final user = authController.userModel!.user!;

          return ListView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            children: [
              // Profile Header Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                   ],
                ),
                child: Column(
                  children: [
                    // Profile Image
                    Stack(
                      children: [
                        Container(
                          height: 100,
                          width: 100,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: Get.theme.primaryColor.withOpacity(0.2), width: 3),
                            image: DecorationImage(
                              image: user.profileImage != null
                                  ? NetworkImage(user.profileImage!)
                                  : const AssetImage(Images.logo2) as ImageProvider,
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: Get.theme.primaryColor,
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2),
                            ),
                            child: const Icon(Icons.camera_alt_rounded, color: Colors.white, size: 16),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 15),

                    // Name and Role
                    Text(
                      user.name ?? "User Name",
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF2D3E50),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: Get.theme.primaryColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        (user.role ?? "User").toUpperCase(),
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Get.theme.primaryColor,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 25),

              // Information Section
              const Text(
                "Personal Information",
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF2D3E50),
                ),
              ),
              const SizedBox(height: 15),

              _buildInfoTile(
                icon: Icons.phone_android_rounded,
                title: "Phone Number",
                value: user.phone ?? "Not provided",
                color: Colors.blue,
              ),
              _buildInfoTile(
                icon: Icons.email_outlined,
                title: "Email Address",
                value: user.email ?? "Not provided",
                color: Colors.orange,
              ),
              _buildInfoTile(
                icon: Icons.verified_user_outlined,
                title: "Account Status",
                value: (user.isVerified ?? false) ? "Verified Account" : "Not Verified",
                color: (user.isVerified ?? false) ? Colors.green : Colors.red,
                trailing: (user.isVerified ?? false)
                    ? const Icon(Icons.verified, color: Colors.green, size: 20)
                    : null,
              ),
              // _buildInfoTile(
              //   icon: Icons.calendar_today_outlined,
              //   title: "Joined On",
              //   value: user.createdAt != null
              //       ? DateFormat('MMMM dd, yyyy').format(user.createdAt!)
              //       : "Unknown",
              //   color: Colors.purple,
              // ),

              const SizedBox(height: 30),

              // Settings & Support Section
              const Text(
                "Settings & Support",
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF2D3E50),
                ),
              ),
              const SizedBox(height: 15),

              _buildActionTile(icon: Icons.notifications_none_rounded, title: "Notifications"),
              _buildActionTile(icon: Icons.privacy_tip_outlined, title: "Privacy Policy"),
              _buildActionTile(icon: Icons.help_outline_rounded, title: "Help & Support"),

              const SizedBox(height: 20),

              // Logout Button
              TextButton.icon(
                onPressed: () => authController.clearSharedData(),
                icon: const Icon(Icons.logout_rounded, color: Colors.redAccent),
                label: const Text(
                  "Logout Account",
                  style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold),
                ),
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
              const SizedBox(height: 40),
            ],
          );
        },
      ),
    );
  }

  Widget _buildInfoTile({
    required IconData icon,
    required String title,
    required String value,
    required Color color,
    Widget? trailing,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 15),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: Colors.grey.withOpacity(0.05)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[500],
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF2D3E50),
                  ),
                ),
              ],
            ),
          ),
          if (trailing != null) trailing,
        ],
      ),
    );
  }

  Widget _buildActionTile({required IconData icon, required String title}) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 5),
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.grey.withOpacity(0.1),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: Colors.grey[700], size: 20),
      ),
      title: Text(
        title,
        style: const TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w500,
          color: Color(0xFF2D3E50),
        ),
      ),
      trailing: Icon(Icons.chevron_right_rounded, color: Colors.grey[400]),
      onTap: () {},
    );
  }
}
