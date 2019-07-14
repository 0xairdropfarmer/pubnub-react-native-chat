/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import PubNubReact from "pubnub-react";
import React, { Component } from "react";
import { StyleSheet, Image, Button, FlatList, Text, View } from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import AsyncStorage from "@react-native-community/async-storage";
import _ from "lodash";
import config from "./config";
const RoomName = "MainChat1";
export default class MainChat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // isTyping: false,
      messages: [],
      onlineUsers: [],
      onlineUsersCount: 0,
      isTyping: false,
      whoTyping: []
    };
    this.pubnub = new PubNubReact({
      publishKey: config.pubnub_publishKey,
      subscribeKey: config.pubnub_subscribeKey,
      uuid: this.props.navigation.getParam("username"),
      // logVerbosity: true
      presenceTimeout: 60
    });
    this.pubnub.init(this);
    this.detectTyping = this.detectTyping.bind(this);
  }
  getData = async () => {
    try {
      const value = await AsyncStorage.getItem("@loggedInUser");
      if (value !== null) {
        return value;
      }
    } catch (e) {
      console.log(e);
    }
  };
  detectTyping = text => {
    if (text != "") this.init = true;
    this.startTyping();
    this.stopTyping();
  };
  Typing = () => {
    let self = this;
    // this.init is fix as the indicator would run when the app mounts
    this.init = false;
    this.startTyping = _.debounce(() => {
      if (!this.init) return;
      this.PNState(true);
    }, 1000);

    this.stopTyping = _.debounce(() => {
      if (!this.init) return;
      this.PNState(false);
    }, 4000);
  };
  PNState = state => {
    let username = this.props.navigation.getParam("username");
    this.pubnub.setState({
      state: {
        isTyping: state
      },
      uuid: username,
      channels: [RoomName]
    });
  };
  isTypingGif = () => {
    console.log(this.state.isTyping);
    if (this.state.isTyping) {
      return (
        <Image
          style={{ position: "absolute", width: 50, height: 50 }}
          source={require("../img/istyping.gif")}
        />
      );
    }
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
          messages: GiftedChat.append(previousState.messages, newmessage)
        }));
      }
    );
    this.PresenceStatus();
  }

  componentWillMount() {
    this.Typing();
    this.props.navigation.setParams({
      onlineUsersCount: this.state.onlineUsersCount,
      leaveChat: this.leaveChat.bind(this)
    });

    this.pubnub.subscribe({
      channels: [RoomName],
      withPresence: true
    });
    this.pubnub.getMessage(RoomName, m => {
      this.setState(previousState => ({
        messages: GiftedChat.append(previousState.messages, m["message"])
      }));
    });

    // this.hereNow();
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
      if (presence.action === "state-change") {
        let typingIn = [];
        if (presence.state.isTyping == true) {
          typingIn.push({ uuid: presence.uuid });
          this.setState({ whoTyping: typingIn });
        } else {
          let typingOut = typingIn.filter(
            users => users.uuid !== presence.uuid
          );
          this.setState({ whoTyping: typingOut });
        }
      }
      if (presence.action === "join") {
        let users = this.state.onlineUsers;

        users.push({
          state: presence.state,
          uuid: presence.uuid
        });
        console.log("join room");
        this.setState({
          onlineUsers: users,
          onlineUsersCount: this.state.onlineUsersCount + 1
        });
        this.props.navigation.setParams({
          onlineUsersCount: this.state.onlineUsersCount
        });
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
      }

      if (presence.action === "interval") {
        console.log("interval");
        if (presence.join || presence.leave || presence.timeout) {
          let onlineUsers = this.state.onlineUsers;
          let onlineUsersCount = this.state.onlineUsersCount;

          if (presence.join) {
            console.log("join room at state");
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
            console.log("leave room at state");
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
    this.leaveChat();
  }

  render() {
    let username = this.props.navigation.getParam("username");
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.online_user_wrapper}>
          {this.state.onlineUsers.map((item, index) => {
            return (
              <View key={item.uuid} style={styles.avatar_wrapper}>
                {this.state.whoTyping.map((data, index) => {
                  if (data.uuid == item.uuid && data.uuid != username) {
                    return (
                      <Image
                        key={item.uuid}
                        style={styles.istyping_gif}
                        source={require("../img/istyping.gif")}
                      />
                    );
                  }
                })}
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
          onInputTextChanged={this.detectTyping}
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
  footerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7bb64"
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
    margin: 10
  },
  online_user_wrapper: {
    height: "8%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  avatar_wrapper: {},
  istyping_gif: {
    position: "absolute",
    left: 20,
    height: 30,
    width: 30
    // justifyContent: "flex-end"
  }
});
