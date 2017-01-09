<!doctype html>

<html lang="en">
<head>
  <meta charset="utf-8">

  <title>$Title</title>
  <style>
  body{
      background-color:"#fff";
      height:450px;
      padding:0;
      width:100%;
  }
  </style>
</head>

<body>

<% if $AddForm %>

    $AddForm

<% else %>

    <% include TableFilterSortHeader %>

    <% include TableFilterSortTable %>

    <% include TableFilterSortFooter %>

<% end_if %>

</body>
</html>
