<template>
  <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100 no-scrollbar">
    <MessageInfo
      message="سلام محمدرضا، وقتت بخیر."
      time="10:15"
      :is-me="false"
    />

    <MessageInfo
      message="سلام! خیلی ممنون، وقت شما هم بخیر. چه کمکی از دستم برمی‌آید؟"
      time="10:16"
      :is-me="true"
    />

    <MessageInfo
      message="راستش داشتم روی یک پروژه جدید با Vue و Tailwind کار می‌کردم و به چند نکته در مورد مدیریت Layout نیاز داشتم. امکانش هست کمی وقت داشته باشی؟"
      time="10:18"
      :is-me="false"
    />

    <MessageInfo
      message="البته حتماً! خوشحال می‌شم کمک کنم. در مورد چه بخشی هست؟ استایل‌ها یا منطق کامپوننت‌ها؟"
      time="10:19"
      :is-me="true"
    />

    <MessageInfo
      message="بیشتر در مورد مدیریت ارتفاع Viewport و استفاده از h-dvh برای چت‌باکس‌ها. می‌خوام در موبایل هم دقیقاً مثل دسکتاپ عمل کنه."
      time="10:20"
      :is-me="false"
    />

    <MessageInfo
      message="آهان، متوجه شدم. برای این کار بهتره از کلاس h-dvh استفاده کنی و برای بخش پیام‌ها هم flex-1 و overflow-y-auto رو تنظیم کنی تا اسکرول فقط در اون قسمت اتفاق بیفته."
      time="10:22"
      :is-me="true"
    />

    <MessageInfo
      message="دمت گرم! دقیقاً همین کار رو کردم و الان هم داره عالی کار می‌کنه. ممنون از راهنماییت."
      time="10:23"
      :is-me="false"
    />

    <MessageInfo
      message="خواهش می‌کنم، خوشحالم که حل شد! 🙏"
      time="10:24"
      :is-me="true"
    />

  </div>
</template>

<script setup lang="ts"></script>
