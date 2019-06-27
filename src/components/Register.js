import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity
} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
const user = { username: "admin", password: 1111 };
class Register extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
      confirm_password: ""
    };
  }

  async register() {
    if (
      this.state.email != "" &&
      this.state.password != "" &&
      this.state.confirm_password != ""
    ) {
      await AsyncStorage.setItem("user", JSON.stringify(this.state));
      let dat = await AsyncStorage.getItem("user");
      console.log(JSON.parse(dat));
      // this.props.navigation.navigate("MainChat", {
      //   username: this.state.email
      // });
    } else {
      console.log(this.state);
      alert("username or password is empty");
    }
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Register for Chat</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={username => this.setState({ username })}
        />
        <TextInput
          style={styles.input}
          secureTextEntry={true}
          placeholder="Password"
          onChangeText={password => this.setState({ password })}
        />
        <TextInput
          style={styles.input}
          secureTextEntry={true}
          placeholder="Confirm Password"
          onChangeText={confirm_password => this.setState({ confirm_password })}
        />
        <TouchableOpacity style={styles.btn} onPress={() => this.register()}>
          <Text style={styles.btntext}>Register Now</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    bottom: 66
  },
  welcome: {
    fontSize: 30,
    textAlign: "center",
    margin: 10,
    fontWeight: "300"
  },
  input: {
    width: "90%",
    backgroundColor: "skyblue",
    padding: 15,
    marginBottom: 10
  },
  btnContiner: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%"
  },
  btn: {
    backgroundColor: "orange",
    padding: 15,
    width: "45%"
  },
  btntext: { fontSize: 16, textAlign: "center" },
  logo: {
    flexDirection: "row"
  }
});
export default Register;
