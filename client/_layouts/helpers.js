import { ActiveRoute } from 'meteor/zimme:active-route';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// A store which is local to this file
const showConnectionIssue = new ReactiveVar(false);

const CONNECTION_ISSUE_TIMEOUT = 5000;

Meteor.startup(() => {
  // Only show the connection error box if it has been 5 seconds since
  // the app started
  setTimeout(() => {
    // Show the connection error box
    showConnectionIssue.set(true);
  }, CONNECTION_ISSUE_TIMEOUT);
});

export const events = {
  'click .js-menu'(event, instance) {
    instance.state.set('menuOpen', !instance.state.get('menuOpen'));
  },

  'click .content-overlay'(event, instance) {
    instance.state.set('menuOpen', false);
    event.preventDefault();
  },

  'click .js-user-menu'(event, instance) {
    instance.state.set('userMenuOpen', !instance.state.get('userMenuOpen'));
    // stop the menu from closing
    event.stopImmediatePropagation();
  },

  'click #menu a'(event, instance) {
    instance.state.set('menuOpen', false);
  },

  'click .js-logout'() {
    Meteor.logout();

    // if we are on a private list, we'll need to go to a public one
    if (ActiveRoute.name('Lists.show')) {
      // TODO -- test this code path
      // const list = Lists.findOne(FlowRouter.getParam('_id'));
      // if (list.userId) {
      //   FlowRouter.go('Lists.show', Lists.findOne({ userId: { $exists: false } }));
      // }
    }
  },

  'click .js-new-organization'() {
    const _id = insert.call((err) => {
      if (err) {
        FlowRouter.go('App.home');
        alert(`Could not create organization. ${err.reason}`);
      }
    });
    FlowRouter.go('organizations.show', { _id });
  },
};


export const helpers = {
  menuOpen() {
    const instance = Template.instance();
    return instance.state.get('menuOpen') && 'menu-open';
  },
  cordova() {
    return Meteor.isCordova && 'cordova';
  },
  emailLocalPart() {
    const email = Meteor.user().emails[0].address;
    return email.substring(0, email.indexOf('@'));
  },
  userMenuOpen() {
    const instance = Template.instance();
    return instance.state.get('userMenuOpen');
  },
  lists() {
    // return Lists.find({ $or: [
    //   { userId: { $exists: false } },
    //   { userId: Meteor.userId() },
    // ] });
  },
  activeListClass(list) {
    const active = ActiveRoute.name('Lists.show')
      && FlowRouter.getParam('_id') === list._id;

    return active && 'active';
  },
  connected() {
    if (showConnectionIssue.get()) {
      return Meteor.status().connected;
    }

    return true;
  },
  isAdmin() {
    const u = Meteor.user();
    return u === undefined ? false : u.isAdmin;
  },
  activeIfRouteNameIs(routeName) {
    return routeName === FlowRouter._current.route.name ? 'active' : '';
  },
  activeIfRouteNameMatches(regex) {
    const currentRouteName = FlowRouter._current.route.name;
    return currentRouteName.match(regex) ? 'active' : '';
  },
  templateGestures: {
    'swipeleft .cordova'(event, instance) {
      instance.state.set('menuOpen', false);
    },
    'swiperight .cordova'(event, instance) {
      instance.state.set('menuOpen', true);
    },
  },
};

export function onCreated() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    menuOpen: false,
    userMenuOpen: false,
  });
}
