import 'package:get/get.dart';

class Dimensions {
  static double fontSizeExtraSmall = Get.context!.width >= 1300 ? 14 : 10;
  static double fontSizeSmall = Get.context!.width >= 1300 ? 16 : 12;
  static double fontSizeDefault = Get.context!.width >= 1300 ? 18 : 16;
  static double fontSizeLarge = Get.context!.width >= 1300 ? 20 : 18;
  static double fontSizeExtraLarge = Get.context!.width >= 1300 ? 22 : 22;
  static double fontSizeOverLarge = Get.context!.width >= 1300 ? 32 : 30;

  static const double paddingSizeExtraSmall = 6.0;
  static const double paddingSizeSmall = 10.0;
  static const double paddingSizeDefault = 16.0;
  static const double paddingSizeLarge = 20.0;
  static const double paddingSizeExtraLarge = 24.0;
  static const double paddingSizeOverLarge = 30.0;

  static const double radiusSmall = 6.0;
  static const double radiusDefault = 12.0;
  static const double radiusLarge = 16.0;
  static const double radiusExtraLarge = 20.0;
  static const double radiusOverLarge = 26.0;
}
