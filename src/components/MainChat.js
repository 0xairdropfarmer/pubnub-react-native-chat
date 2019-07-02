/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import { Card } from "react-native-elements";
import PubNubReact from "pubnub-react";
import React, { Component } from "react";
import { StyleSheet, Image, Button, FlatList, Text, View } from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
const RoomName = "MainChat";
export default class MainChat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      onlineUsers: [],
      onlineUsersCount: 0
    };

    this.pubnub = new PubNubReact({
      publishKey: "pub-c-5b74ec65-efe0-4be6-95f9-96b8167d7588",
      subscribeKey: "sub-c-3f6e41aa-8609-11e9-98ee-ee7e7bd32b12",
      uuid: this.props.navigation.getParam("username"),
      presenceTimeout: 10
    });
    this.pubnub.init(this);
  }

  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: navigation.getParam("onlineUsersCount") + " member online",
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
  componentWillMount() {
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
      }

      if (presence.action === "leave" || presence.action === "timeout") {
        let leftUsers = this.state.onlineUsers.filter(
          users => users.uuid !== presence.uuid
        );

        this.setState({
          onlineUsers: leftUsers
        });

        const length = this.state.onlineUsers.length;
        this.setState({
          onlineUsersCount: length
        });
        this.props.navigation.setParams({
          onlineUsersCount: this.state.onlineUsersCount
        });
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
  hereNow = () => {
    this.pubnub.hereNow(
      {
        channels: [RoomName],
        includeUUIDs: true,
        includeState: false
      },
      (status, response) => {
        console.log(response.channels[RoomName].occupants);
        this.setState({
          onlineUsers: response.channels[RoomName].occupants,
          onlineUsersCount: response.channels[RoomName].occupancy
        });
      }
    );
  };
  leaveChat = () => {
    this.pubnub.unsubscribe({ channels: [RoomName] });
    return this.props.navigation.navigate("Login");
  };
  componentWillUnmount() {
    this.leaveChat();
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.online_user_wrapper}>
          {this.state.onlineUsers.map((item, index) => {
            return (
              <View>
                <Image
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
            _id: this.props.navigation.getParam("username")
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
    backgroundColor: "grey",
    flexWrap: "wrap"
  }
});
