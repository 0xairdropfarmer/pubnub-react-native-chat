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

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      history: [],
    };
    this.id = this.randomid();
    this.pubnub = new PubNubReact({
      publishKey: "your key",
      subscribeKey: "your key",
    });
    this.pubnub.init(this);
  }

  componentWillMount() {
    this.pubnub.subscribe({
      channels: ["ReactChat"],
      message: message => console.log("sub", message),
    });

    this.pubnub.getMessage("ReactChat", m => {
      this.setState(previousState => ({
        messages: GiftedChat.append(previousState.messages, m["message"]),
      }));
      // this.setState({ messages: m['message'] });
      // console.log(m['message']);
    });
  }
  onSend(messages = []) {
    // this.setState(previousState => ({
    //   messages: GiftedChat.append(previousState.messages, messages),
    // }));
    console.log("49", messages);
    this.pubnub.publish({
      message: messages,
      channel: "ReactChat",
    });
  }
  randomid = () => {
    return Math.floor(Math.random() * 100);
  };
  componentWillUnmount() {
    this.pubnub.unsubscribe({ channels: ["ReactChat"] });
  }

  render() {
    return (
      <GiftedChat
        messages={this.state.messages}
        onSend={messages => this.onSend(messages)}
        user={{
          _id: this.id,
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
    backgroundColor: "#F5FCFF",
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10,
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5,
  },
});
