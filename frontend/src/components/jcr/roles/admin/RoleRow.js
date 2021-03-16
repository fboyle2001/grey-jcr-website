import React from 'react';
import PropTypes from 'prop-types';
import api from '../../../../utils/axiosConfig';

class RoleROw extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      disabled: false,
      deleted: false,
      edited: false,
      name: this.props.role.name,
      assignedUsers: this.props.role.JCRRoleUserLinks.map(entry => entry.User),
      username: ""
    }
  }

  saveRow = async () => {
    this.setState({ disabled: true });

    const { name } = this.state;

    try {
      await api.post("/jcr/role/update", { id: this.props.role.id, name });
    } catch (error) {
      alert(error.response.data.error);
      this.setState({ disabled: false });
      return;
    }

    this.setState({ disabled: false, edited: false });
  }

  deleteRow = async () => {
    this.setState({ disabled: true });
    const confirmed = window.confirm("Are you sure you want to fully delete this committee?");

    if(!confirmed) {
      this.setState({ disabled: false });
      return;
    }

    try {
      await api.delete(`/jcr/role/${this.props.role.id}`);
    } catch (error) {
      alert(error.response.data.error);
      this.setState({ disabled: false });
      return;
    }

    this.setState({ deleted: true });
  }

  onInputChange = e => {
    this.setState({ [e.target.name]: (e.target.type === "checkbox" ? e.target.checked : e.target.value), edited: true })
  }

  onInputUsernameChange = e => {
    this.setState({ [e.target.name]: (e.target.type === "checkbox" ? e.target.checked : e.target.value) })
  }

  makeDisplayName = (result) => {
    const split = result.firstNames.split(",");
    let firstName = split[0];
    firstName = firstName.substring(0, 1).toUpperCase() + firstName.substring(1).toLowerCase();
    let surname = result.surname;
    surname = surname.substring(0, 1).toUpperCase() + surname.substring(1).toLowerCase();

    return `${firstName} ${surname}`;
  }

  removeUserFromRole = async (userId) => {
    this.setState({ disabled: true });

    try {
      await api.delete(`/jcr/role/${this.props.role.id}/user/${userId}`);
    } catch (error) {
      alert(error.response.data.error);
      return;
    }

    let { assignedUsers } = this.state;
    assignedUsers = assignedUsers.filter(user => user.id !== userId);

    this.setState({ disabled: false, assignedUsers });
  }

  addUserToRole = async () => {
    this.setState({ disabled: true });
    const { username } = this.state;

    let result;

    try {
      result = await api.post("/jcr/role/user", { id: this.props.role.id, username });
    } catch (error) {
      alert(error.response.data.error);
      this.setState({ disabled: false });
      return;
    }

    let { assignedUsers } = this.state;
    assignedUsers.push(result.data.user);
    this.setState({ disabled: false, assignedUsers, username: "" });
  }

  render () {
    if(this.state.deleted) {
      return null;
    }

    return (
      <tr className="text-center border-b border-gray-400">
        <td className="p-2 border-r border-gray-400">
          <input
            type="text"
            name="name"
            value={this.state.name}
            className="w-full border border-grey-500 rounded py-1 px-2 focus:outline-none focus:ring-2 disabled:opacity-50 focus:ring-gray-400"
            onChange={this.onInputChange}
            autoComplete=""
            maxLength={255}
          />
        </td>
        <td className="p-2 border-r border-gray-400">
          <ul className="text-left list-disc list-inside px-2">
            {
              this.state.assignedUsers.map((user, j) => (
                <li className="mb-2">
                  {this.makeDisplayName(user)} ({user.username})
                  <button
                    onClick={() => this.removeUserFromRole(user.id)}
                    className="ml-2 px-2 py-1 rounded bg-red-900 text-white w-auto font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
                    disabled={this.state.disabled}
                  >Remove</button>
                </li>
              ))
            }
          </ul>
          <div className="flex flex-col items-start p-1 border">
            <p className="font-semibold text-lg">Add User</p>
            <div>
              <span>Username:</span>
              <input
                type="text"
                name="username"
                value={this.state.username}
                className="ml-2 w-48 border border-grey-500 rounded py-1 px-2 focus:outline-none focus:ring-2 disabled:opacity-50 focus:ring-gray-400"
                onChange={this.onInputUsernameChange}
                autoComplete=""
                maxLength={6}
              />
              <button
                className="ml-2 px-4 py-1 rounded bg-green-900 text-white w-auto font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
                disabled={this.state.disabled || this.state.username.length !== 6}
                onClick={this.addUserToRole}
              >Add</button>
            </div>
          </div>
        </td>
        <td className="p-2 border-r border-gray-400">
          <button
            onClick={this.saveRow}
            className="px-4 py-1 rounded bg-green-900 text-white w-auto font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
            disabled={this.state.disabled || !this.state.edited}
          >Save</button>
        </td>
        <td className="p-2 border-r border-gray-400">
          <button
            onClick={this.deleteRow}
            className="px-4 py-1 rounded bg-red-900 text-white w-auto font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
            disabled={this.state.disabled}
          >Delete</button>
        </td>
      </tr>
    );
  }
}

export default RoleROw;
