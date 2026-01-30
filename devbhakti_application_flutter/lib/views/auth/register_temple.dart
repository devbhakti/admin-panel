import 'dart:developer';
import 'package:dotted_border/dotted_border.dart';
import 'package:image_picker/image_picker.dart';
import 'package:devbhakti/util/images.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'dart:io';
import '../../controller/authcontroller.dart';
import '../../data/api/api_client.dart';
import 'waiting_approval_screen.dart';

class RegisterTemple extends StatefulWidget {
  const RegisterTemple({super.key});

  @override
  State<RegisterTemple> createState() => _RegisterTempleState();
}

class _RegisterTempleState extends State<RegisterTemple> {
  // Account Identity
  final accountEmailController = TextEditingController();
  final accountPhoneController = TextEditingController();

  // Temple Profile & Institution Details
  final templeNameController = TextEditingController();
  final categoryController = TextEditingController();
  final operatingHoursController = TextEditingController();
  final cityController = TextEditingController();
  final stateController = TextEditingController();
  final fullAddressController = TextEditingController();
  final historyController = TextEditingController();

  // Contact Details
  final contactPersonController = TextEditingController();
  final contactNumberController = TextEditingController();
  final contactEmailController = TextEditingController();

  final ImagePicker _picker = ImagePicker();
  XFile? _mainImage;
  List<XFile> _heroBanners = [];

  Future<void> _pickMainImage() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      setState(() {
        _mainImage = image;
      });
    }
  }

  Future<void> _pickHeroBanners() async {
    final List<XFile> images = await _picker.pickMultiImage();
    if (images.isNotEmpty) {
      setState(() {
        _heroBanners.addAll(images);
      });
    }
  }

  void _removeHeroBanner(int index) {
    setState(() {
      _heroBanners.removeAt(index);
    });
  }

  void _register() {
    String email = accountEmailController.text.trim();
    String phone = accountPhoneController.text.trim();
    String templeName = templeNameController.text.trim();
    
    String category = categoryController.text.trim();
    String openingHours = operatingHoursController.text.trim();
    String city = cityController.text.trim();
    String state = stateController.text.trim();
    String address = fullAddressController.text.trim();
    String history = historyController.text.trim();
    
    String contactPerson = contactPersonController.text.trim();

    if (email.isEmpty || templeName.isEmpty || phone.isEmpty || category.isEmpty || city.isEmpty || state.isEmpty) {
      Get.snackbar("Error", "Please fill all required fields (*)");
      return;
    }

    Map<String, String> body = {
      "name": contactPerson,
      "phone": phone,
      "email": email,
      "templeName": templeName,
      "category": category,
      "openTime": openingHours,
      "description": history,
      "location": city,
      "fullAddress": "$address, $city, $state",
      "poojaIds": "[]",
      "inlineEvents": "[]",
    };

    List<MultipartBody> multipartBody = [];
    if (_mainImage != null) {
      log('Main Image Path: ${_mainImage!.path}');
      multipartBody.add(MultipartBody('image', File(_mainImage!.path)));
    }
    for (int i = 0; i < _heroBanners.length; i++) {
       log('Hero Banner $i Path: ${_heroBanners[i].path}');
      multipartBody.add(MultipartBody('heroImages', File(_heroBanners[i].path)));
    }

    Get.find<AuthController>().registerTempleMultipart(body, multipartBody).then((status) {
      if (status.status) {
        Get.to(() => const WaitingApprovalScreen());
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          SizedBox(
            height: Get.height,
            width: Get.width,
            child: Image.asset(Images.login, fit: BoxFit.cover),
          ),
          Container(
            height: Get.height,
            width: Get.width,
            color: Colors.white.withOpacity(0.85),
          ),
          SafeArea(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              children: [
                _buildTopHeader(),
                const SizedBox(height: 20),
                _buildFormSection(
                  icon: Icons.account_box_outlined,
                  title: "Account Identity",
                  children: [
                    _buildField("Account Email *", "institution@example.com", accountEmailController),
                    _buildField("Account Phone *", "Login Phone Number", accountPhoneController, keyboardType: TextInputType.phone),
                  ],
                ),
                const SizedBox(height: 20),
                _buildFormSection(
                  icon: Icons.temple_hindu_outlined,
                  title: "Temple Profile",
                  children: [
                    _buildField("Temple Official Name *", "e.g. Shri Kashi Vishwanath Temple", templeNameController),
                    Row(
                      children: [
                        Expanded(child: _buildField("City *", "Varanasi", cityController)),
                        const SizedBox(width: 15),
                        Expanded(child: _buildField("State *", "Uttar Pradesh", stateController)),
                      ],
                    ),
                    Row(
                      children: [
                        Expanded(child: _buildField("Category *", "Temple, Shrine, etc.", categoryController)),
                        const SizedBox(width: 15),
                        Expanded(child: _buildField("Opening Hours", "04:00 AM - 11:00 PM", operatingHoursController)),
                      ],
                    ),
                    _buildField("Full Address", "Vishwanath Gali", fullAddressController),
                    _buildField("Temple History", "Ancient temple dedicated to Lord Shiva...", historyController, maxLines: 3),
                  ],
                ),
                const SizedBox(height: 20),
                _buildFormSection(
                  icon: Icons.perm_media_outlined,
                  title: "Media & Assets",
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          flex: 2,
                          child: _buildMainImageUpload(),
                        ),
                        const SizedBox(width: 15),
                        Expanded(
                          flex: 1,
                          child: _buildHeroBannerUpload(),
                        ),
                      ],
                    ),
                    if (_heroBanners.isNotEmpty) ...[
                      const SizedBox(height: 15),
                      _buildHeroBannerList(),
                    ],
                  ],
                ),
                const SizedBox(height: 20),
                _buildFormSection(
                  icon: Icons.contact_phone_outlined,
                  title: "Temple Contact Details",
                  children: [
                    _buildField("Contact Person", "Pandit Ji", contactPersonController),
                    Row(
                      children: [
                        Expanded(child: _buildField("Contact Number", "9876543210", contactNumberController, keyboardType: TextInputType.phone)),
                        const SizedBox(width: 15),
                        Expanded(child: _buildField("Contact Email", "contact@kashivishwanath.in", contactEmailController)),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 40),
                ElevatedButton(
                  onPressed: () => _register(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Get.theme.primaryColor,
                    foregroundColor: Colors.white,
                    minimumSize: const Size(double.infinity, 55),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                  child: const Text("SUBMIT REGISTRATION", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTopHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            IconButton(
              onPressed: () => Get.back(),
              icon: const Icon(Icons.arrow_back, size: 20),
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
            ),
            const SizedBox(width: 10),
            const Text(
              "Register Your Temple",
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                fontFamily: 'Georgia',
                color: Color(0xFF2D3E50),
              ),
            ),
          ],
        ),
        const Padding(
          padding: EdgeInsets.only(left: 30.0),
          child: Text(
            "Create a new institutional account and link it to a temple profile.",
            style: TextStyle(color: Colors.grey, fontSize: 13),
          ),
        ),
      ],
    );
  }

  Widget _buildFormSection({
    required IconData icon,
    required String title,
    required List<Widget> children,
    Widget? trailing,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 20, color: Colors.brown[300]),
              const SizedBox(width: 10),
              Text(
                title,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Georgia',
                  color: Colors.brown[900],
                ),
              ),
              const Spacer(),
              if (trailing != null) trailing,
            ],
          ),
          const Divider(height: 30),
          ...children,
        ],
      ),
    );
  }

  Widget _buildField(
    String label,
    String hint,
    TextEditingController controller, {
    int maxLines = 1,
    TextInputType keyboardType = TextInputType.text,
    bool readOnly = false,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 15.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: Color(0xFF555555),
            ),
          ),
          const SizedBox(height: 8),
          TextFormField(
            controller: controller,
            maxLines: maxLines,
            keyboardType: keyboardType,
            readOnly: readOnly,
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 14),
              filled: true,
              fillColor: const Color(0xFFFFF9F0),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide.none,
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide.none,
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(color: Get.theme.primaryColor.withOpacity(0.3), width: 1),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMainImageUpload() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Main Profile Image",
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: Color(0xFF555555),
          ),
        ),
        const SizedBox(height: 8),
        InkWell(
          onTap: _pickMainImage,
          child: DottedBorder(
            color: Colors.grey.withOpacity(0.5),
            strokeWidth: 1,
            dashPattern: const [6, 3],
            borderType: BorderType.RRect,
            radius: const Radius.circular(8),
            child: Container(
              height: 120,
              width: double.infinity,
              decoration: BoxDecoration(
                color: const Color(0xFFF9F9F9),
                borderRadius: BorderRadius.circular(8),
              ),
              child: _mainImage != null
                  ? Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.file(
                            File(_mainImage!.path),
                            width: double.infinity,
                            height: 120,
                            fit: BoxFit.cover,
                          ),
                        ),
                        Positioned(
                          right: 5,
                          top: 5,
                          child: InkWell(
                            onTap: () {
                              setState(() {
                                _mainImage = null;
                              });
                            },
                            child: Container(
                              padding: const EdgeInsets.all(2),
                              decoration: const BoxDecoration(
                                color: Colors.red,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.close, color: Colors.white, size: 16),
                            ),
                          ),
                        ),
                      ],
                    )
                  : Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.cloud_upload_outlined, color: Colors.grey[400], size: 30),
                        const SizedBox(height: 8),
                        Text(
                          "Click to upload profile image",
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.grey[500], fontSize: 12),
                        ),
                      ],
                    ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildHeroBannerUpload() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Hero Banners",
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: Color(0xFF555555),
          ),
        ),
        const SizedBox(height: 8),
        InkWell(
          onTap: _pickHeroBanners,
          child: DottedBorder(
            color: Colors.grey.withOpacity(0.5),
            strokeWidth: 1,
            dashPattern: const [6, 3],
            borderType: BorderType.RRect,
            radius: const Radius.circular(8),
            child: Container(
              height: 120,
              width: double.infinity,
              decoration: BoxDecoration(
                color: const Color(0xFFF9F9F9),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.add_photo_alternate_outlined, color: Colors.grey[400], size: 30),
                  const SizedBox(height: 4),
                  Text(
                    "Add More",
                    style: TextStyle(color: Colors.grey[500], fontSize: 12),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildHeroBannerList() {
    return SizedBox(
      height: 80,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: _heroBanners.length,
        itemBuilder: (context, index) {
          return Padding(
            padding: const EdgeInsets.only(right: 10),
            child: Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.file(
                    File(_heroBanners[index].path),
                    width: 80,
                    height: 80,
                    fit: BoxFit.cover,
                  ),
                ),
                Positioned(
                  right: 2,
                  top: 2,
                  child: InkWell(
                    onTap: () => _removeHeroBanner(index),
                    child: Container(
                      padding: const EdgeInsets.all(2),
                      decoration: const BoxDecoration(
                        color: Colors.red,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.close, color: Colors.white, size: 12),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildUploadBox(String label, IconData icon, String subtext) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: Color(0xFF555555),
          ),
        ),
        const SizedBox(height: 8),
        Container(
          height: 120,
          width: double.infinity,
          decoration: BoxDecoration(
            color: const Color(0xFFF9F9F9),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: Colors.grey.withOpacity(0.2),
              style: BorderStyle.solid,
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: Colors.grey, size: 30),
              if (subtext.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(
                  subtext,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.grey, fontSize: 12),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}
