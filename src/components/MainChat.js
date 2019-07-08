/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import AsyncStorage from "@react-native-community/async-storage";
import PubNubReact from "pubnub-react";
import React, { Component } from "react";
import { StyleSheet, Image, Button, FlatList, Text, View } from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import OneSignal from "react-native-onesignal";

const RoomName = "MainChat1";
export default class MainChat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // isTyping: false,
      messages: [],
      onlineUsers: [],
      onlineUsersCount: 0
    };
    OneSignal.init("xxxxxxxxxxxxxxxxxxx");
    OneSignal.addEventListener("received", this.onReceived);
    OneSignal.addEventListener("opened", this.onOpened);
    OneSignal.enableSound(true);
    OneSignal.inFocusDisplaying(2);
    OneSignal.configure();
    this.pubnub = new PubNubReact({
      publishKey: "xxxxxxxxxxxxxxxxxx",
      subscribeKey: "xxxxxxxxxxxxxxxx",
      uuid: this.props.navigation.getParam("username"),
      presenceTimeout: 20
    });
    this.pubnub.init(this);
  }
  onReceived = notification => {
    console.log("Notification received: ", notification);
  };

  onOpened = openResult => {
    console.log("Message: ", openResult.notification.payload.body);
    console.log("Data: ", openResult.notification.payload.additionalData);
    console.log("isActive: ", openResult.notification.isAppInFocus);
    console.log("openResult: ", openResult);
  };

  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle:
        navigation.getParam("onlineUsersCount", "No") + " member online",
      headerLeft: null,
      headerRight: (
        <Button
          onPress={() => {
            navigation.state.params.leaveChat();
          }}
          title="Logout"
          color="red"
        />
      )
    };
  };
  getPushUserId = () => {
    let userId = OneSignal.getPermissionSubscriptionState(data => {
      return data.userId;
    });
    this.setState({ userId: userId });
  };
  componentDidMount() {
    this.pubnub.history(
      { channel: RoomName, reverse: true, count: 15 },
      (status, res) => {
        console.log(status);
        let newmessage = [];
        res.messages.forEach(function(element, index) {
          newmessage[index] = element.entry[0];
        });
        this.setState(previousState => ({
          messages: GiftedChat.append(
            previousState.messages,
            newmessage.reverse()
          )
        }));
      }
    );
  }
  sendNotification = data => {
    let headers = {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: "Basic xxxxxxxxxxxxxxxx"
    };

    let endpoint = "https://onesignal.com/api/v1/notifications";

    let params = {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        app_id: "xxxxxxxxxxxxxxxx",
        included_segments: ["All"],
        include_player_ids: this.state.userId,
        priority: 10,
        contents: { en: data }
      })
    };
    fetch(endpoint, params).then(res => console.log(res));
  };
  componentWillMount() {
    this.props.navigation.setParams({
      onlineUsersCount: this.state.onlineUsersCount,
      leaveChat: this.leaveChat.bind(this)
    });
    this.getPushUserId();
    this.pubnub.subscribe({
      channels: [RoomName],
      withPresence: true
    });
    // this.PubNub.state({
    //   channel: [RoomName],
    //   uuid: this.props.navigation.getParam("username"),
    //   state: isTyping
    // });
    this.pubnub.getMessage(RoomName, m => {
      this.setState(previousState => ({
        messages: GiftedChat.append(previousState.messages, m["message"])
      }));
    });

    // this.hereNow();
    this.PresenceStatus();
  }
  onSend(messages = []) {
    // this.setState(previousState => ({
    //   messages: GiftedChat.append(previousState.messages, messages),
    // }));
    this.pubnub.publish({
      message: messages,
      channel: RoomName
    });
  }

  PresenceStatus = () => {
    this.pubnub.getPresence(RoomName, presence => {
      if (presence.action === "join") {
        let users = this.state.onlineUsers;

        users.push({
          state: presence.state,
          uuid: presence.uuid
        });

        this.setState({
          onlineUsers: users,
          onlineUsersCount: this.state.onlineUsersCount + 1
        });
        this.props.navigation.setParams({
          onlineUsersCount: this.state.onlineUsersCount
        });
        this.sendNotification(presence.uuid + " join room");
      }

      if (presence.action === "leave" || presence.action === "timeout") {
        let leftUsers = this.state.onlineUsers.filter(
          users => users.uuid !== presence.uuid
        );

        this.setState({
          onlineUsers: leftUsers
        });
        console.log("leave room");
        const length = this.state.onlineUsers.length;
        this.setState({
          onlineUsersCount: length
        });
        this.props.navigation.setParams({
          onlineUsersCount: this.state.onlineUsersCount
        });
        this.sendNotification(presence.uuid + " leave room");
      }

      if (presence.action === "interval") {
        if (presence.join || presence.leave || presence.timeout) {
          let onlineUsers = this.state.onlineUsers;
          let onlineUsersCount = this.state.onlineUsersCount;

          if (presence.join) {
            presence.join.map(
              user =>
                user !== this.uuid &&
                onlineUsers.push({
                  state: presence.state,
                  uuid: user
                })
            );

            onlineUsersCount += presence.join.length;
          }

          if (presence.leave) {
            presence.leave.map(leftUser =>
              onlineUsers.splice(onlineUsers.indexOf(leftUser), 1)
            );
            onlineUsersCount -= presence.leave.length;
            console.log("leave room");
          }

          if (presence.timeout) {
            presence.timeout.map(timeoutUser =>
              onlineUsers.splice(onlineUsers.indexOf(timeoutUser), 1)
            );
            onlineUsersCount -= presence.timeout.length;
          }

          this.setState({
            onlineUsers,
            onlineUsersCount
          });
          this.props.navigation.setParams({
            onlineUsersCount: this.state.onlineUsersCount
          });
        }
      }
    });
  };

  leaveChat = () => {
    this.pubnub.unsubscribe({ channels: [RoomName] });
    return this.props.navigation.navigate("Login");
  };
  componentWillUnmount() {
    OneSignal.removeEventListener("received", this.onReceived);
    OneSignal.removeEventListener("opened", this.onOpened);
    this.leaveChat();
  }

  render() {
    let username = this.props.navigation.getParam("username");
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.online_user_wrapper}>
          {this.state.onlineUsers.map((item, index) => {
            return (
              <View key={item.uuid}>
                <Image
                  key={item.uuid}
                  style={styles.online_user_avatar}
                  source={{
                    uri: "https://robohash.org/" + item.uuid
                  }}
                />
              </View>
            );
          })}
        </View>
        <GiftedChat
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
            _id: username,
            name: username,
            avatar: "https://robohash.org/" + username
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  online_user_avatar: {
    width: 50,
    height: 50,
    borderRadius: 20,
    margin: 10
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  online_user_wrapper: {
    height: "8%",
    justifyContent: "flex-end",
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap"
  }
});
