<% if MyList %>
<table class="tableFilterSortTable">
    <thead>
        <tr>
            <th scope="col">
                <a href="#" class="sortable" data-sort-field="Title" data-sort-direction="asc" data-sort-type="string">Title</a>
            </th>
            <th scope="col">
                <a href="#" class="sortable" data-sort-field="Tags" data-sort-direction="asc" data-sort-type="strig">Tags</a>
            </th>
        </tr>
    </thead>



<tbody>
    <% loop MyList %>
<tr class="tfsRow hide" id="tfs$ID">
<td>
    <a href="$RetrieveLink">
        <span data-filter="Title">$Title</span>
    </a>
</td>
<td><% loop Tags %><span data-filter="Tags">$Title</span><% end_loop %></td>
</tr>
    <% end_loop %>
</tbody>


</table>

<% else %>
    <p>Sorry, no data is currently available.</p>
<% end_if %>