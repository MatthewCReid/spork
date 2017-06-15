/* global localStorage */
import React, { Component } from 'react';
import { ButtonToolbar, Button, Col, Well } from 'react-bootstrap';
import {
  updateIngredients,
  saveRecipe,
  checkUser,
} from '../../../utils/utils';
import Recipes from '../MealMatcher/MealMatcher';
import PersonalFridge from '../PersonalFridge/PersonalFridge';
import Events from '../Events/Events';
import Nav from '../Nav/Nav';
import MyFavRecipes from '../MyFavRecipes/MyFavRecipes';
import TwilioText from '../TwilioText/TwilioText';
import TeamFridge from '../TeamFridge/TeamFridge';

const axios = require('axios');

export default class MainMeal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      done: false,
      ingredients: [],
      recipies: [],
      profile: props.auth.getProfile(),
    };
    props.auth.on('profile_updated', (newProfile) => {
      this.setState({ profile: newProfile });
      checkUser(JSON.parse(localStorage.profile), this.getMyIngredients);
    });
    this.onClick = this.onClick.bind(this);
  }

  onSubmit(e) {
    e.preventDefault();
    const value = this.title.value;
    updateIngredients(value);
    this.title.value = '';
    this.getMyIngredients();
  }
  getMyIngredients() {
    const params = JSON.parse(localStorage.profile).nickname;
    axios.get(`/my_ingredients/${params}`)
      .then((response) => {
        this.setState({ ingredients: response.data });
        this.render();
      });
  }
  getRecipe(e) {

    e.preventDefault();
    const value = this.title.value;
    this.findRecipe(value);
  }

  findRecipe(ingredients) {
    const params = ingredients.replace(',', '/');
    console.log("FINDRECIPE", params);
    axios.get(`/find_recipe/${params}`)
      .then((response) => {
        console.log("RESPHITS", response.data.hits)
        const recipies = response.data.hits.map(recipe => ({
          name: recipe.recipe.label,
          ingredients: recipe.recipe.ingredientLines,
          image: recipe.recipe.image,
          url: recipe.recipe.uri,
        }));
        this.setState({ recipies });
        this.render();
      });
  }
  likeRecipe(recipe) {
    saveRecipe(recipe);
  }
  onClick(e) {
    const params = e.target.name;
    axios.delete(`/delete_ingredient/${params}`)
      .then((response) => {
        this.setState({ ingredients: response.data });
        this.render();
      });
  }
  render() {
    return (
      <div>
        <Nav navBar={this.props} />
        <Col md={3}>
          <div>
            <form>
              <Well>
                <h2>Personal Fridge</h2>
                <Button bsStyle="info" type="button" onClick={this.onSubmit.bind(this)} >Show Ingredients</Button>
              </Well>
            </form>
            <div>
              <PersonalFridge ingredients={this.state.ingredients} onClick={this.onClick} />
            </div>
          </div>
        </Col>
        <Col md={6} lg={6}>
          <div>
            <ul>
              <Well className="row">
                <form>
                  <h2>Hey Chef!</h2>
                  <input
                    className="col-md-9"
                    type="text"
                    ref={c => this.title = c}
                    name="title"
                    placeholder="Search For Recipies Here"
                  />
                  <Button className="col-md-3" bsStyle="info" type="button" onClick={this.getRecipe.bind(this)}>Search Recipes</Button>
                </form>
              </Well>
              {this.state.recipies
                .map((item, key) => <Recipes item={item} key={key} likeRecipe={this.likeRecipe} />)}
            </ul>
            <TeamFridge />
          </div>
        </Col>
        <Col md={3} lg={3}>
          <div>
            <Well>
              <MyFavRecipes myRecipes={this.props} />
            </Well>
          </div>
        </Col>
        <div>
          <TwilioText />
        </div>
      </div>
    );
  }
}
            // <FriendList friendLi={this.props} />
            // <Well>
            //   <Events eventLi={this.props} />
            // </Well>