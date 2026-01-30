import 'package:flutter/material.dart';
import 'package:get/get.dart';

class InputField1 extends StatelessWidget {
  final String title;
  final String? subtitle;
  final TextEditingController controller;
  final FocusNode? focusNode;
  final FocusNode? nextFocus;
  final Color? bgColor;
  final Color? textColor;
  final double? width;
  final double? height;
  final double? radius;
  final double? textSize;
  final TextInputType? keyboardType;
  final bool readOnly;
  final int? maxLength;
  final ValueChanged<String>? onChanged;

  final IconData? suffixIcon; // ✅ New parameter for suffix icon
  final Color? suffixIconColor; // ✅ New parameter for suffix icon color
  final VoidCallback? onSuffixIconTap; // ✅ New parameter for suffix icon tap

  const InputField1({
    Key? key,
    required this.title,
    required this.controller,
    this.focusNode,
    this.nextFocus,
    this.keyboardType,
    this.bgColor,
    this.textColor,
    this.width,
    this.height,
    this.radius,
    this.textSize,
    this.subtitle,
    this.readOnly = false,
    this.maxLength,
    this.suffixIcon,
    this.suffixIconColor,
    this.onSuffixIconTap,
    this.onChanged, // ✅ ADD HERE
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(top: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (subtitle != null)
            Padding(
              padding: const EdgeInsets.only(left: 5.0),
              child: Text(
                subtitle!,
                style: TextStyle(
                  color: textColor ?? Get.theme.primaryColor,
                  fontSize: textSize ?? 15,
                  fontWeight: FontWeight.bold
                ),
              ),
            ),
          SizedBox(height: subtitle != null ? 8 : 0),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            width: width ?? Get.width,
            height: height ?? 55,
            decoration: BoxDecoration(
              color: bgColor ?? Colors.transparent,
              borderRadius: BorderRadius.circular(radius ?? 8),border: Border.all(color: Get.theme.primaryColor)
            ),
            child: TextFormField(
              controller: controller,
              focusNode: focusNode,
              keyboardType: keyboardType ?? TextInputType.text,
              readOnly: readOnly,
              maxLength: maxLength,
              onChanged: onChanged, // ✅ ADD HERE
              onFieldSubmitted: (_) {
                if (nextFocus != null) {
                  nextFocus!.requestFocus();
                }
              },
              style: const TextStyle(
                fontSize: 16,
                color: Colors.black,
              ),
              decoration: InputDecoration(
                counterText: "",
                border: InputBorder.none,
                hintText: title,
                hintStyle: TextStyle(
                  fontSize: 14,
                  color: Colors.black.withOpacity(0.5),
                ),
                suffixIcon: suffixIcon != null
                    ? GestureDetector(
                  onTap: onSuffixIconTap,
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    child: Icon(
                      suffixIcon,
                      color: suffixIconColor ?? Colors.grey[600],
                      size: 20,
                    ),
                  ),
                )
                    : null,
              ),
            ),

          ),
        ],
      ),
    );
  }
}
