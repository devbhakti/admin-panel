import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../util/dimensions.dart';

class Button extends StatelessWidget {
  final String title;
  final Function onTap;
  final Color? bgColor;
  final Color? textColor;
  final double? height;
  final double? textSize;
  final double? width;
  final double? radius;

  const Button(
      {Key? key,
      required this.title,
      required this.onTap,
      this.bgColor,
      this.height,
      this.width,
      this.radius,
      this.textColor,
      this.textSize})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        onTap();
      },
      child: Container(
        height: height ?? 50,
        width: width ?? Get.width,
        decoration: BoxDecoration(
          // color: bgColor ?? Theme.of(context).primaryColor,
          gradient: LinearGradient(colors: [Get.theme.primaryColor,Get.theme.secondaryHeaderColor,]),
          borderRadius: BorderRadius.circular(radius ?? Dimensions.radiusDefault),
        ),
        child: Center(
          child: Text(
            title,
            style: TextStyle(
                color: textColor ?? Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: textSize ?? Dimensions.fontSizeLarge),
          ),
        ),
      ),
    );
  }
}
