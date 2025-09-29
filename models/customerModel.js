import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  image : {
    type : String,
    required: true
  },
  
}, {
  timestamps: true
});

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;