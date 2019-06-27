/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import PubNubReact from "pubnub-react";
import React, { Component } from "react";
import { StyleSheet } from "react-native";
import { GiftedChat } from "react-native-gifted-chat";

export default class MainChat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      curr_user: ""
    };
    this.id = this.randomid();
    this.pubnub = new PubNubReact({
      publishKey: "pub-c-5b74ec65-efe0-4be6-xxxx-xxxx",
      subscribeKey: "sub-c-3f6e41aa-8609-11e9-xxxx-xxxxx"
    });
    this.pubnub.init(this);
  }
  componentDidMount() {
    this.pubnub.history(
      { channel: "MainChat", reverse: true, count: 15 },
      (status, res) => {
        let newmessage = [];
        res.messages.forEach(function(element, index) {
          newmessage[index] = element.entry[0];
        });
        console.log(newmessage);
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
    this.pubnub.subscribe({
      channels: ["MainChat"],
      message: message => console.log("sub", message)
    });

    this.pubnub.getMessage("MainChat", m => {
      this.setState(previousState => ({
        messages: GiftedChat.append(previousState.messages, m["message"])
      }));
      // this.setState({ messages: m['message'] });
      // console.log(m['message']);
    });
  }
  onSend(messages = []) {
    // this.setState(previousState => ({
    //   messages: GiftedChat.append(previousState.messages, messages),
    // }));
    this.pubnub.publish({
      message: messages,
      channel: "MainChat"
    });
  }
  randomid = () => {
    return Math.floor(Math.random() * 100);
  };
  componentWillUnmount() {
    this.pubnub.unsubscribe({ channels: ["MainChat"] });
  }

  render() {
    return (
      <GiftedChat
        messages={this.state.messages}
        onSend={messages => this.onSend(messages)}
        user={{
          _id: this.props.navigation.getParam("username")
        }}
      />
    );
  }
}

const styles = StyleSheet.create({
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
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  }
});
