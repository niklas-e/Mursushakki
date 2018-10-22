import * as React from "react";
import { withRouter } from "react-router-dom";
import { withStyles, createStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import ApiService from "../../common/ApiService";

import Majava from "../../common/Majava";

const styles = createStyles({
    root: {
        display: "flex",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center"
    },
    formContainer: {
        width: 500,
        padding: 25,
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center"
    },
    button: {
        margin: "10px 0"
    }
})

class SignUpView extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            isLoading: false,
            error: ""
        }
    }

    public render() {
        const { classes } = this.props

        const form = (
            <React.Fragment>
                <TextField
                    id="email"
                    label="Email"
                    type="email"
                    margin="normal"
                    onChange={this.handleInputChange}
                />
                <TextField
                    id="username"
                    label="Username"
                    margin="normal"
                    onChange={this.handleInputChange}
                />
                <TextField
                    id="password"
                    label="Password"
                    type="password"
                    margin="normal"
                    onChange={this.handleInputChange}
                />
                <TextField
                    id="passwordConfirm"
                    label="Confirm password"
                    type="password"
                    margin="normal"
                    onChange={this.handleInputChange}
                />
                <Button
                    variant="raised"
                    color="primary"
                    onClick={this.handleSubmit}
                    className={classes.button}
                >
                    <Typography color="inherit">Register</Typography>
                </Button>
            </React.Fragment>
        )

        return (
            <div className={classes.root}>
                <Paper className={classes.formContainer}>
                    <Majava animation={this.state.isLoading && "spin"}/>
                    <Typography color="error">{this.state.error}</Typography>
                    {!this.state.isLoading && form}
                </Paper>
            </div>
        );
    }

    private handleSubmit = async () => {
        if (this.state.password !== this.state.passwordConfirm) {
            this.setState({error: "Passwords don't match D:"})
        } else {
            this.setState({isLoading: true});
            try {
                await ApiService.write.register({email: this.state.email, name: this.state.username, password: this.state.password} as global.IUserContract);
                this.props.history.push("/login");
            } catch (error) {
                this.setState({isLoading: false, error: error.message})
            }
        }
    }

    private handleInputChange = event => {
        const target = event.target;
        const value = target.type === "checkbox" ? target.checked : target.value;
        const id = target.id;

        this.setState({
          [id]: value
        });
    }
}

export default withStyles(styles)(withRouter(SignUpView));
