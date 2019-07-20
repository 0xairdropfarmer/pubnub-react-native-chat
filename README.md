<h1 align="center">Welcome to Pubnub React native Chat app 👋</h1>
<img src="https://i.imgur.com/DTAgxdN.gif" />
<p>
  <img src="https://img.shields.io/badge/version-0.0.1-blue.svg?cacheSeconds=2592000" />
  <a href="https://twitter.com/@krissanawat101">
    <img alt="Twitter: @krissanawat101" src="https://img.shields.io/twitter/follow/@reactninja.svg?style=social" target="_blank" />
  </a>
</p>

> Build chat app with React native giftedchat and pubnub

## Install

```sh
git clone https://github.com/krissnawat/pubnub-react-native-chat
yarn or npm install
```

## Usage
add your key 
```jsx
this.pubnub = new PubNubReact({
      publishKey: "your key",
      subscribeKey: "your key",
 });
```
and run two simulator for testing
```sh
react-native run-android  
react-native run-ios
```

## Run tests

```sh
npm run test
```
## Todo
- [X] [Basic setup with GiftedChat](https://www.pubnub.com/blog/building-a-chat-app-with-react-native-and-pubnub-part-one-messaging/)
- [X] [Add Basic Auth and display history message by user](https://www.pubnub.com/blog/building-a-chat-app-with-react-native-and-pubnub-part-two-message-history/)
- [X] Add online user count and avatar
- [X] [Improve Auth with Auth0](https://imgur.com/a/lrhJwri)
- [ ] Typing Indicator
- [ ] one to one chat
- [ ] unread message counts
- [ ] Push Notifications
- [ ] add emoji
- [ ] send file and image also making preview 
- [ ] sending location
- [ ] Chatbot Integrations
- [ ] Content Moderation with filter word 
- [ ] Language Translation on the fly with AWS Translate
- [ ] redesign UI baseon this [article](https://medium.com/@victorvarghese/building-facebook-messenger-clone-in-react-native-6d0f77bcd926)
## Author

👤 **Krissanawat**

* Twitter: [@krissanawat101](https://twitter.com/@krissanawat101)
* Github: [@krisanawat](https://github.com/krissnawat)

## Show your support

Give a ⭐️ if this project helped you!

<img src="https://d2c805weuec6z7.cloudfront.net/Powered_By_PubNub.png" alt="Powered By PubNub" width="200"></a>
