# Retain essential networking libraries
-keep class okhttp3.** { *; }
-keep class com.google.gson.** { *; }
-keep class retrofit2.** { *; }
-keep class com.squareup.okhttp3.** { *; }

# Prevent warnings for missing references
-dontwarn okhttp3.**
-dontwarn retrofit2.**
-dontwarn com.google.gson.**

# Allow debugging for better error messages
-keepattributes Exceptions, InnerClasses, Signature, Annotation
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
