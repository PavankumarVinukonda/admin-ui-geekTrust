import {Component} from 'react'
import {TailSpin} from "react-loader-spinner";

import Pagination from '../pagination'
import Users from '../users'

import './index.css'

const requestStatusState = {
  loading: 'LOADING',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

class App extends Component {
  state = {
    searchUserInput: '',
    users: [],
    selectAll: false,
    pagesCount: 0,
    requestStatus: 'LOADING',
  }

  componentDidMount = () => {
    this.getAllUsers()
  }

  getAllUsers = async () => {
    this.setState({
      requestStatus: 'LOADING',
    })

    const url =
      'https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json'

    const response = await fetch(url)

    if (response.ok === true) {
      const fetchedData = await response.json()
      const updatedUsers = fetchedData.map(eachUser => ({
        ...eachUser,
        isChecked: false,
      }))
      this.setState({
        users: updatedUsers,
        requestStatus: 'SUCCESS',
      })
    } else {
      this.setState({
        requestStatus: 'FAILED',
      })
    }
  }

  routeTo = pageNo => {
    this.setState({
      pagesCount: pageNo - 1,
    })
  }

  getCheckedUsers = users => {
    const checkedUsers = users.map(user => {
      if (user.isChecked === true) {
        return user.id
      }
      return null
    })
    return checkedUsers
  }

  deleteSelected = () => {
    const {users} = this.state
    const checkedUsersIds = this.getCheckedUsers(users)
    const updatedUsers = users.filter(
      eachUser => !checkedUsersIds.includes(eachUser.id),
    )
    this.setState({
      users: updatedUsers,
      selectAll: false,
    })
  }

  onClickDelete = id => {
    const {users} = this.state
    const remainingUsers = users.filter(eachUser => eachUser.id !== id)
    this.setState({
      users: remainingUsers,
    })
  }

  updateUser = userData => {
    const {users} = this.state
    const updatedUsersData = users.map(eachUser => {
      if (eachUser.id === userData.id) {
        return userData
      }
      return eachUser
    })
    this.setState({
      users: updatedUsersData,
    })
  }

  onChangeUserCheckBoxid = id => {
    const {users} = this.state
    const userid = id
    
    const updatedUserdata = users.map(item => ({
      id:item.id,
      email:item.email,
      name:item.name,
      role:item.role,
      isChecked: item.id === userid ? (!item.isChecked) : (item.isChecked)
    }))
    
    this.setState({
      users:updatedUserdata
    })
  }

  onToggleCheckAllCheckbox = () => {
    const {selectAll, users} = this.state
    this.setState({
      selectAll: !selectAll,
    })

    const searchResult = this.getSearchResults(users)
    const presentPageUsers = this.getCurrentPageUsers(searchResult)
    const currentPageUserIds = presentPageUsers.map(eachUser => eachUser.id)
    if (selectAll === false) {
      const updatedUsers = users.map(eachUser => {
        if (currentPageUserIds.includes(eachUser.id)) {
          return {...eachUser, isChecked: true}
        }
        return eachUser
      })
      this.setState({
        users: updatedUsers,
      })
    } else {
      const updatedUsers = users.map(eachUser => ({
        ...eachUser,
        isChecked: false,
      }))
      this.setState({
        users: updatedUsers,
      })
    }
  }

  onSearchInput = event => {
    this.setState({
      searchUserInput: event.target.value,
      pagesCount: 0,
    })
  }

  getCurrentPageUsers = searchResult => {
    const {pagesCount} = this.state
    const resultLength = searchResult.length
    const usersPerPage = 10
    const previousPageUsers = pagesCount * usersPerPage
    const remainingUsers = resultLength - previousPageUsers
    let currentPageUsers = []
    if (remainingUsers <= usersPerPage) {
      currentPageUsers = searchResult.slice(previousPageUsers)
    } else {
      currentPageUsers = searchResult.slice(
        previousPageUsers,
        previousPageUsers + usersPerPage,
      )
    }

    return currentPageUsers
  }

  getSearchResults = () => {
    const {searchUserInput, users} = this.state
    const searchResult = users.filter(
      eachUser =>
        eachUser.name.toLowerCase().startsWith(searchUserInput.toLowerCase()) ||
        eachUser.email
          .toLowerCase()
          .startsWith(searchUserInput.toLowerCase()) ||
        eachUser.role.toLowerCase().startsWith(searchUserInput.toLowerCase()),
    )
    return searchResult
  }

  renderSuccessView = () => {
    const {users, pagesCount, searchUserInput, selectAll} = this.state
    const searchResults = this.getSearchResults()
    const currentPageUsers = this.getCurrentPageUsers(searchResults)
    console.log(users)
    return (
      <div className='users-container' >
        <input
          type="search"
          value={searchUserInput}
          placeholder="Search by name, email or role"
          onChange={this.onSearchInput}
          className="search-input"
        />
        {currentPageUsers.length === 0 ? (
          <div>
            <center>Sorry, No Users Found</center>
          </div>
        ) : (
          <div className="users-list">
            <div className="user-list-header">
              <div className='checkbox-container' >
              <input
                type="checkbox"
                className="checkbox"
                onChange={this.onToggleCheckAllCheckbox}
                checked={selectAll}
              />
              </div>
              <div className='headers-contaier' >
              <h1 className="header-name">Name</h1>
              </div>
              <div className='headers-contaier' >
              <h1 className="header-email">Email</h1>
              </div>
              <div className='headers-contaier' >
              <h1 className="header-role">Role</h1>
              </div>
              <div className='headers-contaier' >
              <h1 className="header-actions">Actions</h1>
              </div>
            </div>
            <ul className='ul-users-list' >
                {currentPageUsers.map(eachUser => (
                  <Users
                    users={eachUser}
                    key={eachUser.id}
                    updateUser={this.updateUser}
                    deleteUser={this.onClickDelete}
                    onChangeUserCheckBox={this.onChangeUserCheckBoxid}
                  />
                ))}
            </ul>
            
          </div>
        )}
        <Pagination
          users={users}
          deleteSelected={this.deleteSelected}
          pagesCount={pagesCount}
          routeTo={this.routeTo}
          activeClassName={"paginationActive"}
        />
        
      </div>
    )
  }

  renderLoadingView = () => (
    <div className="loader-container" data-testid="loader">
       <TailSpin color="#0b69ff" height="50" width="50" />
    </div>
  )

  renderUsersPage = () => {
    const {requestStatus} = this.state
    switch (requestStatus) {
      case requestStatusState.loading:
        return this.renderLoadingView()

      case requestStatusState.success:
        return this.renderSuccessView()

      case requestStatusState.failure:
        return this.renderFailureView()

      default:
        return null
    }
  }

  render() {
    
    return (
      <div className="bg-container">
        <h1 className='heading'>Admin Ui</h1>
        <div className="admin-page">{this.renderUsersPage()}</div>
      </div>
    )
  }
}

export default App